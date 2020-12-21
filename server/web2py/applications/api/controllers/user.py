def login():
    result = auth_jwt.jwt_token_manager()
    if result and "token" in result:
        response.headers["x-gg-userid"] = auth.user_id
    return result

def register():
    request.vars.email = request.vars.username
    request.vars.password = db.auth_user.password.validate(request.vars.password)[0]
    result = auth.get_or_create_user(request.vars)
    return response.json(result)


def register_credentials():
    username = request.vars.username
    password = request.vars.password

    registerRequest = {
        "email":username,
        "password":password
    }

    user = auth.register_bare(**registerRequest)
    
    result = {}
    
    if user:
        userId = db(db.auth_user.email == username).select().first().id

        result = {"id":userId}

    return response.json(result)

def authenticate_credentials():

    result = auth_jwt.jwt_token_manager()

    if result and "token" in result:
        response.headers["x-gg-userid"] = auth.user_id
    else:
        response.headers["x-gg-authreason"] = "authenticate_credentials.FAILED_AUTH"

        raise HTTP(401,**response.headers)

def authenticate_token():

    result = auth_jwt.jwt_token_manager()

    if result and "token" in result:
        response.headers["x-gg-userid"] = auth.user_id
        return result
    else:
        response.headers["x-gg-authreason"] = "authenticate_credentials.FAILED_TOKEN"
        raise HTTP(401,**response.headers)