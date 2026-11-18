"""DelniDB diagrams for chapter 4, drawn from the live catalogue (schema_live.json):
  erdN_*.drawio  - logical ERD (keys + key attributes, crow's-foot notation, Arabic entity names)
  dbN_*.drawio   - physical database diagram (every column, data type, NULL), SSMS-like
Every relation line is a real foreign key in DelniDB and is anchored on the FK row and the PK row."""
import json, os, sys
from xml.sax.saxutils import escape as _e
def escape(s): return _e(s, {"\"": "&quot;"})

HERE = os.path.dirname(os.path.abspath(__file__))
S = json.load(open(os.path.join(HERE, "schema_live.json"), encoding="utf-8"))
AR = json.load(open(os.path.join(HERE, "arnames.json"), encoding="utf-8"))
OUT = sys.argv[1]

KEY_ATTRS = {
    "tourists": ["full_name", "email", "account_status"],
    "tour_guides": ["full_name", "verification_status", "availability_status"],
    "transportation_companies": ["company_name", "city", "verification_status"],
    "vehicles": ["vehicle_type", "seating_capacity", "vehicle_status"],
    "drivers": ["full_name", "operational_status", "current_trip_stage"],
    "places_tourist": ["place_name", "city", "category"],
    "places_tourist_highlights": ["highlight_name", "display_order"],
    "hotels": ["hotel_name", "city", "star_rating"],
    "restaurants_cafes": ["facility_name", "facility_type", "city"],
    "daily_trips": ["trip_title", "price_per_seat", "available_seats"],
    "weekly_trips": ["trip_title", "start_date", "end_date"],
    "private_trips": ["status_order", "preferred_start_date", "quoted_price"],
    "bookings_daily": ["trip_date", "number_of_seats", "payment_status"],
    "bookings_weekly": ["number_of_seats", "booking_status", "payment_status"],
    "reviews_daily_trips": ["stars_rating"], "reviews_weekly_trips": ["stars_rating"],
    "offers_daily_trips": ["percent_discount", "end_date"], "offers_weekly_trips": ["discount_percentage", "end_date"],
    "daily_trip_stations": ["station_order", "station_title"], "weekly_trip_stations": ["day_number", "station_title"],
    "private_trip_stations": ["day_number", "station_title"],
    "notifications": ["recipient_role", "title", "is_read"], "support_conversations": ["owner_role", "created_at"],
    "support_messages": ["sender_role", "is_read"], "users": ["name", "email"],
    "personal_access_tokens": ["token", "expires_at"], "migrations": ["migration", "batch"],
}

# module -> (title, columns of tables). Tables not "own" are drawn as compact references in the ERD.
GROUPS = [
    ("1_people_transport", "المرشدون والمعالم وشركات النقل", [
        ["guide_working_days", "guide_places", "places_tourist_highlights"],
        ["tour_guides", "places_tourist"],
        ["transportation_companies", "vehicles", "drivers"]], None),
    ("2_daily", "الرحلات اليومية", [
        ["tour_guides", "vehicles", "restaurants_cafes", "places_tourist"],
        ["daily_trip_days", "daily_trips", "places_trip_daily"],
        ["daily_trip_stations", "offers_daily_trips", "bookings_daily", "reviews_daily_trips"],
        ["tourists"]], ["tour_guides", "vehicles", "restaurants_cafes", "places_tourist", "tourists"]),
    ("3_weekly", "الرحلات الأسبوعية", [
        ["tour_guides", "vehicles", "hotels", "restaurants_cafes", "places_tourist"],
        ["hotels_trip_weekly", "weekly_trips", "restaurants_trip_weekly", "places_trip_weekly"],
        ["weekly_trip_stations", "offers_weekly_trips", "bookings_weekly", "reviews_weekly_trips"],
        ["tourists"]], ["tour_guides", "vehicles", "hotels", "restaurants_cafes", "places_tourist", "tourists"]),
    ("4_private", "الرحلات الخاصة (VIP)", [
        ["tourists", "tour_guides", "vehicles"],
        ["private_trips", "private_trip_stations"],
        ["places_trip_private", "hotels_trip_private"],
        ["places_tourist", "hotels"]], ["tourists", "tour_guides", "vehicles", "places_tourist", "hotels"]),
    ("5_facilities", "الفنادق والمطاعم والمقاهي", [
        ["hotel_amenities", "restaurant_features"],
        ["hotels", "restaurants_cafes"]], None),
    ("6_favorites", "مفضلة السائح", [
        ["daily_trips", "weekly_trips", "hotels", "restaurants_cafes", "places_tourist", "vehicles"],
        ["favorite_daily_trips", "favorite_weekly_trips", "favorite_hotels", "favorite_restaurants", "favorite_places", "favorite_vehicles"],
        ["tourists"]],
        ["daily_trips", "weekly_trips", "hotels", "restaurants_cafes", "places_tourist", "vehicles"]),
    ("7_system", "الإشعارات والدعم الفني ورموز الدخول", [
        ["notifications", "migrations"],
        ["tourists", "tour_guides", "drivers", "transportation_companies"],
        ["personal_access_tokens", "support_conversations"],
        ["users", "support_messages"]], ["tourists", "tour_guides", "drivers", "transportation_companies"]),
]

FONT = "Tahoma"
ROW = 28
COLGAP = 100
VGAP = 30
OWN = dict(fill="#DAE8FC", stroke="#3B6BA5", head="#3B6BA5")
REF = dict(fill="#F5F5F5", stroke="#7A7A7A", head="#7A7A7A")


def tlen(c):
    t = c["type"]
    return f'{t}({c["len"]})' if c.get("len") else t


def fk_cols(t):
    return {f["col"] for f in S[t].get("fks", [])}


def rows_for(t, mode, ref):
    cols = S[t]["cols"]
    fkc = fk_cols(t)
    out = []
    for c in cols:
        keys = ("PK" if c["pk"] else "") + ("," if c["pk"] and c["name"] in fkc else "") + ("FK" if c["name"] in fkc else "")
        if mode == "erd":
            if ref and not c["pk"]:
                continue
            if not ref and not keys and c["name"] not in KEY_ATTRS.get(t, []):
                continue
        out.append((c, keys or ("UQ" if c["uq"] and mode == "db" else "")))
    return out


class Doc:
    def __init__(self):
        self.cells = []
        self.n = 0

    def id(self):
        self.n += 1
        return f"c{self.n}"

    def add(self, xml):
        self.cells.append(xml)


def table(doc, t, x, y, mode, ref):
    rows = rows_for(t, mode, ref)
    pal = REF if ref else OWN
    if mode == "erd":
        w_key, w_name = 52, max(170, max(len(c["name"]) for c, _ in rows) * 9 + 24)
        w_type = 0
    else:
        w_key, w_name = 62, max(170, max(len(c["name"]) for c, _ in rows) * 8.6 + 20)
        w_type = max(110, max(len(tlen(c)) for c, _ in rows) * 8.4 + 16)
        w_null = 58
    width = int(w_key + w_name + w_type + (w_null if mode == "db" else 0))
    width = max(width, len(AR[t]) * 9 + 30)
    head = 50
    extra = ROW if mode == "db" else 0
    h = head + extra + ROW * len(rows)
    tid = f"t_{t}"
    label = f'<b style="font-size:15px">{t}</b><br><span style="font-size:13px">{escape(AR[t])}</span>'
    doc.add(f'<mxCell id="{tid}" value="{escape(label)}" style="shape=table;startSize={head};container=1;collapsible=0;childLayout=tableLayout;'
            f'fixedRows=1;rowLines={1 if mode=="db" else 0};columnLines={1 if mode=="db" else 0};fontStyle=0;align=center;resizeLast=1;html=1;whiteSpace=wrap;'
            f'fillColor={pal["head"]};fontColor=#FFFFFF;strokeColor={pal["stroke"]};strokeWidth=2;swimlaneFillColor=#FFFFFF;fontFamily={FONT};rounded=0;" '
            f'vertex="1" parent="1"><mxGeometry x="{x}" y="{y}" width="{width}" height="{h}" as="geometry"/></mxCell>')
    if mode == "erd":
        widths = [w_key, width - w_key]
    else:
        widths = [w_key, int(width - w_key - w_type - w_null), int(w_type), w_null]
    rowids = {}
    if mode == "db":
        hid = f"h_{t}"
        doc.add(f'<mxCell id="{hid}" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=#D9E1EA;collapsible=0;dropTarget=0;'
                f'points=[];top=0;left=0;right=0;bottom=0;strokeColor={pal["stroke"]};" vertex="1" parent="{tid}"><mxGeometry y="50" width="{width}" height="{ROW}" as="geometry"/></mxCell>')
        xo = 0
        for j, (v, wd) in enumerate(zip(["Key", "Column Name", "Data Type", "Null"], widths)):
            doc.add(f'<mxCell id="{hid}_{j}" value="{v}" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;align={"left" if j in (1,2) else "center"};'
                    f'spacingLeft=6;fontSize=13;fontFamily={FONT};fontStyle=1;fontColor=#33475B;html=1;" vertex="1" parent="{hid}"><mxGeometry x="{xo}" width="{wd}" height="{ROW}" as="geometry">'
                    f'<mxRectangle width="{wd}" height="{ROW}" as="alternateBounds"/></mxGeometry></mxCell>')
            xo += wd
    for i, (c, keys) in enumerate(rows):
        rid = f"r_{t}_{c['name']}"
        rowids[c["name"]] = rid
        is_pk = "PK" in keys
        fill = "#EAF2FB" if is_pk and not ref else ("#FFFFFF" if not ref else "#FAFAFA")
        doc.add(f'<mxCell id="{rid}" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor={fill};collapsible=0;'
                f'dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;top=0;left=0;right=0;bottom={1 if is_pk and mode=="erd" and i==sum(1 for _,k in rows if "PK" in k)-1 else 0};'
                f'strokeColor={pal["stroke"]};" vertex="1" parent="{tid}"><mxGeometry y="{head + extra + i*ROW}" width="{width}" height="{ROW}" as="geometry"/></mxCell>')
        vals = [keys, c["name"]] if mode == "erd" else [keys, c["name"], tlen(c), "✓" if c["nullable"] else ""]
        xo = 0
        for j, (v, wd) in enumerate(zip(vals, widths)):
            bold = 1 if (j == 0 or is_pk) else 0
            under = 4 if (is_pk and j == 1) else 0
            color = "#B03A2E" if j == 0 and "PK" in v else ("#1F5F99" if j == 0 else "#111111")
            align = "center" if j in (0, 3) else "left"
            doc.add(f'<mxCell id="{rid}_{j}" value="{escape(v)}" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;'
                    f'{"" if j==0 and mode=="erd" else ""}align={align};spacingLeft=6;overflow=hidden;fontSize=14;fontFamily={FONT};fontStyle={bold | under};'
                    f'fontColor={color};html=1;" vertex="1" parent="{rid}"><mxGeometry x="{xo}" width="{wd}" height="{ROW}" as="geometry">'
                    f'<mxRectangle width="{wd}" height="{ROW}" as="alternateBounds"/></mxGeometry></mxCell>')
            xo += wd
    if mode == "erd" and not ref:
        pass
    return width, h, rowids


def build(key, title, columns, refs, mode):
    refs = set(refs or [])
    doc = Doc()
    placed, sizes = {}, {}
    # measure
    for col in columns:
        for t in col:
            sizes[t] = table(Doc(), t, 0, 0, mode, mode == "erd" and t in refs)[:2]
    heights = [sum(sizes[t][1] for t in col) + VGAP * (len(col) - 1) for col in columns]
    H = max(heights)
    x = 30
    for col, ch in zip(columns, heights):
        cw = max(sizes[t][0] for t in col)
        y = 30 + (H - ch) // 2
        gap = VGAP
        if len(col) > 1 and mode == "erd":
            gap = VGAP + min(60, (H - ch) // (len(col) - 1))
            y = 30 + (H - (sum(sizes[t][1] for t in col) + gap * (len(col) - 1))) // 2
        for t in col:
            w, h, rowids = table(doc, t, x + (cw - sizes[t][0]) // 2, y, mode, mode == "erd" and t in refs)
            placed[t] = rowids
            y += h + gap
        x += cw + COLGAP
    # relations: one line per foreign key (composite keys drawn once)
    seen = set()
    for t in placed:
        for f in S[t].get("fks", []):
            if f["ref"] not in placed or f["name"] in seen:
                continue
            seen.add(f["name"])
            if mode == "erd" and t in refs and f["ref"] in refs:
                continue
            src = placed[t].get(f["col"])
            dst = placed[f["ref"]].get(f["ref_col"])
            if not src or not dst:
                continue
            col = next(c for c in S[t]["cols"] if c["name"] == f["col"])
            unique = col["uq"] and not col["pk"]
            many = "ERzeroToOne" if unique and col["nullable"] else "ERmandOne" if unique else ("ERzeroToMany" if col["nullable"] else "ERmany")
            one = "ERzeroToOne" if col["nullable"] else "ERmandOne"
            doc.add(f'<mxCell id="{doc.id()}" value="" style="edgeStyle=entityRelationEdgeStyle;rounded=0;html=1;startArrow={many};endArrow={one};'
                    f'startFill=0;endFill=0;startSize=14;endSize=14;strokeWidth=2;strokeColor=#2F3B45;segment=24;" edge="1" parent="1" '
                    f'source="{src}" target="{dst}"><mxGeometry relative="1" as="geometry"/></mxCell>')
    W = x - COLGAP + 30
    xml = (f'<mxfile host="Delni" agent="delni-erd"><diagram name="{escape(title)}" id="{key}"><mxGraphModel grid="1" gridSize="10" page="1" '
           f'pageWidth="{W}" pageHeight="{H+60}" math="0" shadow="0"><root><mxCell id="0"/><mxCell id="1" parent="0"/>' + "".join(doc.cells) +
           '</root></mxGraphModel></diagram></mxfile>')
    name = ("erd" if mode == "erd" else "db") + key
    open(os.path.join(OUT, name + ".drawio"), "w", encoding="utf-8").write(xml)
    print(name, W, H + 60)


DB_GROUPS = [
    ("1_accounts", "المرشدون والمعالم السياحية", [["tour_guides", "guide_working_days"], ["guide_places"], ["places_tourist", "places_tourist_highlights"]]),
    ("2_transport", "شركات النقل والمركبات والسائقون", [["transportation_companies"], ["vehicles", "drivers"]]),
    ("3_daily", "الرحلات اليومية", [["daily_trip_days", "daily_trip_stations", "places_trip_daily"], ["daily_trips"], ["offers_daily_trips", "bookings_daily", "reviews_daily_trips"]]),
    ("4_weekly", "الرحلات الأسبوعية", [["weekly_trip_stations", "places_trip_weekly", "hotels_trip_weekly", "restaurants_trip_weekly"], ["weekly_trips"], ["offers_weekly_trips", "bookings_weekly", "reviews_weekly_trips"]]),
    ("5_private", "الرحلات الخاصة", [["private_trip_stations", "places_trip_private", "hotels_trip_private"], ["private_trips"]]),
    ("6_facilities", "الفنادق والمطاعم والمقاهي", [["hotels", "hotel_amenities"], ["restaurants_cafes", "restaurant_features"]]),
    ("7_favorites", "السياح وجداول المفضلة", [["favorite_daily_trips", "favorite_weekly_trips", "favorite_hotels"], ["tourists"], ["favorite_restaurants", "favorite_places", "favorite_vehicles"]]),
    ("8_system", "حسابات الإدارة والإشعارات والدعم الفني ورموز الدخول", [["notifications", "migrations"], ["support_conversations", "support_messages"], ["personal_access_tokens", "users"]]),
]
os.makedirs(OUT, exist_ok=True)
dbcov = []
for key, title, cols in DB_GROUPS:
    build(key, title, cols, None, "db")
    dbcov += [t for c in cols for t in c]
print("db diagrams cover", len(set(dbcov)), "tables; duplicates:", len(dbcov) - len(set(dbcov)), "missing:", set(S) - set(dbcov))
covered = set()
for key, title, cols, refs in GROUPS:
    build(key, title, cols, refs, "erd")
    covered |= {t for c in cols for t in c}
print("tables not in any ERD:", set(S) - covered)
