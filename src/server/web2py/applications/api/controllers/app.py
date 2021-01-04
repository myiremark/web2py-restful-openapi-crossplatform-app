response.view = 'generic.html' # use a generic view

tables_list = UL([LI(A(table,_href=URL("app","grid",args=table))) for table in db.tables if not table.startswith("auth_")])

pages_dict = {
    "myInventoryItems":URL("app","grid",args=["inventoryItem","inventoryItem"],vars={"keywords": 'inventoryItem.idSeller = "%s"' % auth.user_id}),
    "publicInventory":URL("app","grid",args=["inventoryItem","inventoryItem"],vars={"keywords": 'inventoryItem.idSeller != "%s"' % auth.user_id}),
}

def pages():
    tables_list.insert(0,LI(HR(),_style="list-style-type:none"))

    for pageName,pageUrl in pages_dict.iteritems():
        tables_list.insert(0,LI(A(pageName,_href=pageUrl)))
    return dict(message=tables_list)

def grid():
    tablename = request.args(0)
    if not tablename in db.tables: raise HTTP(403)
    grid = SQLFORM.smartgrid(db[tablename], args=[tablename])
    return dict(grid=grid)
