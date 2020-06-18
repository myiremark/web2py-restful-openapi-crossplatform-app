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
