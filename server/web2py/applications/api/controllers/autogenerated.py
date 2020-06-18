# -*- coding: utf-8 -*-

converter = pyDalSwaggerConverter(configuration,request,db)

def swagger():

    result = converter.dal_to_swagger(db)

    updatedSchemas = collections.OrderedDict()

    for table_name,table_def in result["components"]["schemas"].iteritems():
        for key,_property in table_def["properties"].iteritems():
            if "writable" in _property.keys():
                _property.pop("writable")
            if "readable" in _property.keys():
                _property.pop("readable")
            table_def["properties"][key] = _property

        updatedSchemas[table_name] = table_def
            
    result["components"]["schemas"] = updatedSchemas

    result["paths"] = converter.db_patterns_to_swagger_paths(db)

    result["paths"].update(custom_paths)

    return response.json(result)


@auth_jwt.allows_jwt()
@auth.requires_login()
def formSchema():
    table_name = request.args(0)
    swag = converter.dal_to_swagger(db)
    result = swag["components"]["schemas"][table_name]

    _writable_props = {}

    for key,_property in result["properties"].iteritems():
        if _property.get("writable") == True:
            _writable_props[key] = _property

    result["properties"] = _writable_props
    result["components"] = copy.deepcopy(swag["components"])

    return response.json(result)

@auth_jwt.allows_jwt()
@auth.requires_login()
@request.restful()
def api():

    response.view = 'generic.json'

    def GET(*args, **vars):
        patterns = 'auto'
        parser = db.parse_as_rest(patterns, args, vars)
        if parser.status == 200:
            return dict(message=parser.response)
        else:
            raise HTTP(parser.status, parser.error)

    def POST(table_name, **vars):
        return dict(db[table_name].validate_and_insert(**vars))

    def PUT(*args, **vars):
        if args and len(args) > 0:
            table_name = args[0]
            _id_record = vars.get("id")
            query = db[table_name].id == _id_record
            return dict(db(query).validate_and_update(**vars))

    def DELETE(*args, **vars):
        if args and len(args) > 0:
            table_name = args[0]
            _id_record = vars.get("id")
            query = db[table_name].id == _id_record
            return dict(db(query).validate_and_update(**vars))
        return dict()

    return locals()