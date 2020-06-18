@auth_jwt.allows_jwt()
@auth.requires_login()
def index():

    table_name = request.args(0)

    table = db[table_name]
    query = table.created_by == auth.user_id

    rows = db(query).select()

    return response.json(rows)

@auth_jwt.allows_jwt()
@auth.requires_login()
def entity():
    table_name = request.args(0)
    entity_id = request.args(1)

    table = db[table_name]
    query = table.id == entity_id
    row = db(query).select().first()
    return response.json(row)

@auth_jwt.allows_jwt()
@auth.requires_login()
def details():
    table_name = request.args(0)
    entity_id = request.args(1)
    table = db[table_name]
    query = table.id == entity_id
    row = db(query).select().first()

    details = getDetails(row.inventoryItems)

    result = row.as_dict()
    result["inventoryItems"] = details

    return response.json(result)


@auth_jwt.allows_jwt()
@auth.requires_login()
def create():
    table_name = request.args(0)
    data = request.vars
    db.inventoryItem.idSeller.default = auth.user_id
    db.purchaseOrder.idBuyer.default = auth.user_id
    result = db[table_name].insert(**data)

    row = db[table_name](result)

    return response.json(row)

@auth_jwt.allows_jwt()
@auth.requires_login()
def update():
    table_name = request.args(0)
    entity_id = request.args(1)

    table = db[table_name]
    query = table.id == entity_id
    data = request.vars
    result = db(query).update(**data)
    row = db[table_name](entity_id)

    return response.json(row)


def getDetails(ids):
    table = db.inventoryItem
    query = table.id.belongs(ids)
    rows = db(query).select()

    result = []
    for _id in ids:
        result.append(rows.find(lambda r: r.id == _id).first().as_dict())
    return result