import os
import json
import re
import copy
import collections

auth_bearer = {
        "bearerAuth":{
        "type": "http",
        "name": "Authorization",
        "in": "header",
        "description":"Requests should pass an Authorization: Bearer TOKEN_VALUEBASE_64 header"
    }
}

class pyDalSwaggerConverter:
    def __init__(self,configuration,request,db):
        self.configuration = configuration
        self.request = request
        self.db = db

    def custom_paths(self):
        return json.load(open(os.path.join(self.request.folder,"private","static_open_api.json"),"rb"))

    def autogenerated_base(self):
        return "/%s/%s" % (self.request.controller,"api")

    def swaggerBasics(self):
        request = self.request
        configuration = self.configuration
        return {
            "openapi": "3.0.0",
            "servers": [{"url":"http://" + request.env.HTTP_HOST+  "/%s" % (request.application)} ],
            "info": {
                "description": configuration.get("app.description"),
                "version": configuration.get("app.version"),
                "title": configuration.get("app.name"),
                "termsOfService": "http://swagger.io/terms/",
                "contact": {
                    "email": configuration.get("app.author")
                },
                "license": {
                    "name":""
                }
            },
            "tags": [],
            "components":{"securitySchemes":{"bearerAuth":{"type":"http","scheme":"bearer"}}},
            "security" : [{"bearerAuth":[]}]
        }

    def minimal_field_def(self,field_def):
        result = {}
        result["type"] = field_def["type"]
        result["label"] = field_def["label"]
        result["fieldname"] = field_def["fieldname"]
        result["required"] = field_def["required"]
        result["writable"] = field_def["writable"]
        result["readable"] = field_def["readable"]

        return result

    def minimal_table_def(self,table_def):

        result = {}
        fields = []

        result["tablename"] = table_def["tablename"]

        for field in table_def["fields"]:
            field_def = self.minimal_field_def(field)
            fields.append(field_def)

        result["fields"] = fields

        return result

    def dal_table_to_swagger_properties(self,dal_table):
        fields = dal_table["fields"]
        swagger_properties = {}
        for field in fields:
            _property = {}
            fieldname = field.get("fieldname")
            dalFieldType = field.get("type")
            swaggerFieldType = dalFieldType

            if dalFieldType == "id":
                swaggerFieldType = "integer"

            if dalFieldType == "password":
                swaggerFieldType = "string"

            if dalFieldType == "text":
                swaggerFieldType = "string"

            _property["type"] = swaggerFieldType

            if dalFieldType == "datetime":
                _property = {
                    "type": "string",
                    "format": "date-time"
                }

            if dalFieldType == "upload":
                _property = {
                    "type": "string",
                    "format": "base64"
                }

            if dalFieldType.startswith("reference "):
                referenceEntity = dalFieldType.split("reference ")[1]
                _property = {"type": "string"}

            if dalFieldType.startswith("list:"):
                listType = dalFieldType.split("list:")[1]
                if listType.startswith("reference"):
                    referenceEntity = dalFieldType.split("reference ")[1]
                    listItems = {
                            "xml": {
                                "name": referenceEntity
                            },
                            "$ref": "#/components/schemas/%s" % referenceEntity
                        }
                else:
                    listItems = {
                            "xml": {
                                "name": "itemLabel"
                            },
                            "type": "string"
                        }
                
                _property = {
                    "type":"array",
                    "xml": {
                        "wrapped": True
                    },
                    "items":listItems
                }

            _property["readable"] = field.get("readable")
            _property["writable"] = field.get("writable")

            swagger_properties[fieldname] = _property
        return swagger_properties

    def dal_definitions_to_swagger_definitions(self,dal_definitions):

        swagger_definitions = {}

        entities = dal_definitions.keys()

        swagger_definitions = dict.fromkeys(entities)

        for key, definition in swagger_definitions.iteritems():
            dal_table = dal_definitions[key]
            properties = self.dal_table_to_swagger_properties(dal_table)
            definition = {
                "type":"object",
                "xml":{"name":key},
                "properties":properties
            }
            swagger_definitions[key] = definition

        return swagger_definitions


    def swaggerDefinitions_to_tags(self,items):
        return [{
            "name": k, 
            "description": "Everything about %s" % k, 
            "externalDocs": {"description": "Swagger","url": "http://swagger.io"}
            } for k in items]


    def dal_db_min_definitions(self,db):
        min_definitions = {}

        for t in db.tables:
            table = db[t]
            for field in table["fields"]:
                table[field].requires = []
                table[field].represent = None
            table_def = table.as_dict()
            min_definitions[t] = self.minimal_table_def(table_def)
            
        return min_definitions

    def dal_db_to_swagger_definitions(self,db):
        min_definitions = self.dal_db_min_definitions(db)
        swaggerDefinitions = self.dal_definitions_to_swagger_definitions(min_definitions)    

        return swaggerDefinitions

    def dal_to_swagger(self,db):
        # constructs a swagger schema from a pyDAL db instance

        result = self.swaggerBasics()

        swaggerDefinitions = self.dal_db_to_swagger_definitions(db)
        swaggerTags = self.swaggerDefinitions_to_tags(sorted(swaggerDefinitions.keys()))

        schemas = {"schemas":swaggerDefinitions}
        result["components"].update(schemas)
        #result["tags"] = swaggerTags

        return result


    def db_patterns_to_swagger_paths(self,db):
        patterns = 'auto'
        args = ["patterns"]
        parser = db.parse_as_rest(patterns, args, {})

        pathnames = parser.response

        paths = collections.OrderedDict()

        swaggerDefinitions = self.dal_db_to_swagger_definitions(db)

        def convertPathParam(pathDictParam):
            values = pathDictParam.split(".")
            newValue = "".join([v[0].upper() + v[1:] for v in values]).replace("]","").replace(":","")
            return newValue

        def get_returned_entity(p):
            return p.split("/")[1].split("[")[0]

        for pathname in pathnames:

            regex_dict = r"\{(\w+.\w*[.\w*]*)\}*"
            regex_list = r"\[(\w+.\w*[.\w*]*)\]*"
            #regex_field = r"(:field)*"
            regex_field = r"(\:field*)"

            pathDictParams = re.findall(regex_dict,pathname)
            pathListParams = re.findall(regex_list,pathname)
            pathFieldParams = re.findall(regex_field,pathname)

            original_pathname = pathname[:]

            replacements = {}
            parameters = []

            for pathDictParam in pathDictParams:
                key = "{%s}" % pathDictParam
                converted_value = convertPathParam(pathDictParam)
                parameters.append({"name":converted_value,"in":"path","schema":{"type":"string"}, "required":True})
                replacements[key] = "{%s}" % converted_value

            for pathListParam in pathListParams:
                key = "[%s" % pathListParam
                converted_value = convertPathParam(pathListParam)
                entityKey = get_returned_entity(original_pathname)
                entityDef = swaggerDefinitions.get(entityKey)
                requestBody = {
                    "required":True,
                    "content":{
                        "application/json":{
                            "schema":{
                            "$ref":"#/components/schemas/%s"% entityKey
                            }
                        }
                    }
                }

                replacements[key] = ""

            for pathFieldParam in pathFieldParams:
                key = pathFieldParam
                converted_value = convertPathParam(pathFieldParam)
                entityKey = get_returned_entity(original_pathname)
                entityDef = swaggerDefinitions.get(entityKey)
                fieldNames = entityDef["properties"].keys()

                param = {
                    "name":converted_value,
                    "in":"path",
                    "required":True,
                    "schema": 
                        {
                            "type":"string"
                        }
                    }

                parameters.append(param)
                replacements[key] = "{%s}" % converted_value

            for k,v in replacements.iteritems():
                pathname = pathname.replace(k,v)

            returned_entity = get_returned_entity(original_pathname)

            

            c = len(pathListParams) == 1 and returned_entity.upper() == convertPathParam(pathListParams[0]).upper()

            if c:
                methods = ["post","put","delete"]
                pathContent = {
                    "summary":original_pathname,
                    "requestBody":requestBody,
                    "responses": {
                                    "200": {
                                        "content":{
                                            "application/json": {
                                            "schema": {
                                                "type": "array",
                                                "items": {
                                                    "$ref": "#/components/schemas/%s" % returned_entity
                                                    }
                                                }
                                            }
                                        },
                                        "description":""
                                    },
                                    "400": {
                                        "description": "Invalid request"
                                    }
                                }
                }

            else:
                methods = ["get"]
                pathContent = {
                            #  "tags" : [returned_entity],
                                "parameters": parameters,
                                "summary":original_pathname,
                                "responses": {
                                    "200": {
                                        "content":{
                                            "application/json": {
                                            "schema": {
                                                "type": "array",
                                                "items": {
                                                    "$ref": "#/components/schemas/%s" % returned_entity
                                                    }
                                                }
                                            }
                                        },
                                        "description":""
                                    },
                                    "400": {
                                        "description": "Invalid request"
                                    }
                                },
                            }

            path = collections.OrderedDict()

            for method in methods:
                PathContent = copy.deepcopy(pathContent)
                op_path = pathname.replace("{","").replace("}","").replace("/","")
                operationId =  '%s%s' % (method,op_path)
                PathContent["operationId"] = operationId
                path[method] = PathContent
                
            p = self.autogenerated_base() + pathname
            paths[p] = path

        return paths