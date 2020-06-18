# -*- coding: utf-8 -*-
import requests
# -------------------------------------------------------------------------
# AppConfig configuration made easy. Look inside private/appconfig.ini
# Auth is for authenticaiton and access control
# -------------------------------------------------------------------------
from gluon.contrib.appconfig import AppConfig
from gluon.tools import Auth
from gluon.tools import AuthJWT

# -------------------------------------------------------------------------
# This scaffolding model makes your app work on Google App Engine too
# File is released under public domain and you can use without limitations
# -------------------------------------------------------------------------

if request.global_settings.web2py_version < "2.15.5":
    raise HTTP(500, "Requires web2py 2.15.5 or newer")

# -------------------------------------------------------------------------
# if SSL/HTTPS is properly configured and you want all HTTP requests to
# be redirected to HTTPS, uncomment the line below:
# -------------------------------------------------------------------------
# request.requires_https()

# -------------------------------------------------------------------------
# once in production, remove reload=True to gain full speed
# -------------------------------------------------------------------------
configuration = AppConfig(reload=True)

if not request.env.web2py_runtime_gae:
    # ---------------------------------------------------------------------
    # if NOT running on Google App Engine use SQLite or other DB
    # ---------------------------------------------------------------------
    db = DAL(configuration.get('db.uri'),
             pool_size=configuration.get('db.pool_size'),
             migrate_enabled=configuration.get('db.migrate'),
             check_reserved=['all'])
else:
    # ---------------------------------------------------------------------
    # connect to Google BigTable (optional 'google:datastore://namespace')
    # ---------------------------------------------------------------------
    db = DAL('google:datastore+ndb')
    # ---------------------------------------------------------------------
    # store sessions and tickets there
    # ---------------------------------------------------------------------
    session.connect(request, response, db=db)
    # ---------------------------------------------------------------------
    # or store session in Memcache, Redis, etc.
    # from gluon.contrib.memdb import MEMDB
    # from google.appengine.api.memcache import Client
    # session.connect(request, response, db = MEMDB(Client()))
    # ---------------------------------------------------------------------

# -------------------------------------------------------------------------
# by default give a view/generic.extension to all actions from localhost
# none otherwise. a pattern can be 'controller/function.extension'
# -------------------------------------------------------------------------
response.generic_patterns = [] 
if request.is_local and not configuration.get('app.production'):
    response.generic_patterns.append('*')

# -------------------------------------------------------------------------
# choose a style for forms
# -------------------------------------------------------------------------
response.formstyle = 'bootstrap4_inline'
response.form_label_separator = ''

# -------------------------------------------------------------------------
# (optional) optimize handling of static files
# -------------------------------------------------------------------------
# response.optimize_css = 'concat,minify,inline'
# response.optimize_js = 'concat,minify,inline'

# -------------------------------------------------------------------------
# (optional) static assets folder versioning
# -------------------------------------------------------------------------
# response.static_version = '0.0.0'

# -------------------------------------------------------------------------
# Here is sample code if you need for
# - email capabilities
# - authentication (registration, login, logout, ... )
# - authorization (role based authorization)
# - services (xml, csv, json, xmlrpc, jsonrpc, amf, rss)
# - old style crud actions
# (more options discussed in gluon/tools.py)
# -------------------------------------------------------------------------

# host names must be a list of allowed host names (glob syntax allowed)
auth = Auth(db, host_names=configuration.get('host.names'))

# -------------------------------------------------------------------------
# create all tables needed by auth, maybe add a list of extra fields
# -------------------------------------------------------------------------
auth.settings.extra_fields['auth_user'] = []
auth.define_tables(username=False, signature=False)


auth_jwt = AuthJWT(auth, secret_key='secret',expiration=60*30)

# -------------------------------------------------------------------------
# configure email
# -------------------------------------------------------------------------
mail = auth.settings.mailer
mail.settings.server = 'logging' if request.is_local else configuration.get('smtp.server')
mail.settings.sender = configuration.get('smtp.sender')
mail.settings.login = configuration.get('smtp.login')
mail.settings.tls = configuration.get('smtp.tls') or False
mail.settings.ssl = configuration.get('smtp.ssl') or False

# -------------------------------------------------------------------------
# configure auth policy
# -------------------------------------------------------------------------
auth.settings.registration_requires_verification = False
auth.settings.registration_requires_approval = False
auth.settings.reset_password_requires_verification = True

# -------------------------------------------------------------------------  
# read more at http://dev.w3.org/html5/markup/meta.name.html               
# -------------------------------------------------------------------------
response.meta.author = configuration.get('app.author')
response.meta.description = configuration.get('app.description')
response.meta.keywords = configuration.get('app.keywords')
response.meta.generator = configuration.get('app.generator')
response.show_toolbar = configuration.get('app.toolbar')

# -------------------------------------------------------------------------
# your http://google.com/analytics id                                      
# -------------------------------------------------------------------------
response.google_analytics_id = configuration.get('google.analytics_id')

# -------------------------------------------------------------------------
# maybe use the scheduler
# -------------------------------------------------------------------------
if configuration.get('scheduler.enabled'):
    from gluon.scheduler import Scheduler
    scheduler = Scheduler(db, heartbeat=configuration.get('scheduler.heartbeat'))

# -------------------------------------------------------------------------
# after defining tables, uncomment below to enable auditing
# -------------------------------------------------------------------------
# auth.enable_record_versioning(db)

INVENTORY_ITEM_TYPES = ["product","service"]
PURCHASE_ORDER_STATUSES = ["created","submitted","paid"]

IS_INVENTORYITEM=IS_IN_SET(INVENTORY_ITEM_TYPES)

IS_PAYMENTSTATUS=IS_IN_SET(PURCHASE_ORDER_STATUSES)

db.define_table("inventoryItem",
    Field("idSeller","reference auth_user"),
    Field("category","string"),
    Field("title","string"),
    Field("description","text"),
    Field("image","upload"),
    Field("availableQuantity","integer"),
    Field("tags","list:string"),
    Field("isPublic","boolean"),
    auth.signature
)

db.define_table("purchaseOrder",
    Field("paymentStatus","string"),
    Field("idSeller","reference auth_user"),
    Field("idBuyer","reference auth_user"),
    Field("inventoryItems","list:reference inventoryItem"),
    auth.signature
)

class ESIndexer:
    def __init__(self, db):
        self.db = db
        self.index = "inventoryitems"
        self.url_template_create = "http://localhost:9200/%s/_create/%s"
        self.url_template_update = "http://localhost:9200/%s/_doc/%s"

    def index_item(self,id_item,data,update=False):
        template = self.url_template_create

        if update:
            template = self.url_template_update

        url = template  % (self.index, str(id_item))

        print "indexing"
        print url
        print requests.put(url,json=data).text

def set_db_defaults_and_requires(db):
    db.inventoryItem.id.writable = False
    db.inventoryItem.idSeller.default = auth.user_id
    db.inventoryItem.idSeller.writable = False
    db.inventoryItem.category.requires = IS_INVENTORYITEM
    db.inventoryItem.category.default = INVENTORY_ITEM_TYPES[0]
    db.inventoryItem.availableQuantity.default = 0
    db.inventoryItem.isPublic.default = False
    db.inventoryItem.isPublic.readable = False
    db.inventoryItem.image.writable = False
    db.inventoryItem.description.default = ''
    db.inventoryItem.tags.default = []


    db.inventoryItem._common_filter = lambda query: ((db.inventoryItem.isPublic == True) | (db.inventoryItem.idSeller == auth.user_id))

    db.purchaseOrder.paymentStatus.requires = IS_PAYMENTSTATUS
    db.purchaseOrder.paymentStatus.writable = False
    db.purchaseOrder.paymentStatus.default = PURCHASE_ORDER_STATUSES[0]

    db.purchaseOrder.inventoryItems.requires = IS_IN_DB(db,db.inventoryItem,'(%(id)s) %(title)s - sold by userID (%(idSeller)s)',multiple=True)

    db.purchaseOrder.idSeller.requires = IS_IN_DB(db,db.auth_user)
    db.purchaseOrder.idSeller.writable = False
    db.purchaseOrder.idSeller.readable = False

    db.purchaseOrder.idBuyer.requires = IS_IN_DB(db,db.auth_user)
    db.purchaseOrder.idBuyer.writable = False
    db.purchaseOrder.idBuyer.readable = False
    db.purchaseOrder.idBuyer.default = auth.user_id

    db.purchaseOrder._common_filter = lambda query: (db.purchaseOrder.idBuyer == auth.user_id) | (db.purchaseOrder.idSeller == auth.user_id)


    def before_insert_purchaseOrder(f):
        # one Seller per PO
        inventoryItems = f.inventoryItems
        rows = db(db.inventoryItem.id.belongs(inventoryItems)).select()
        idsSellers = [r.idSeller for r in rows]

        if len(set(idsSellers)) >1:
            session.flash = "Error: One Seller per PO"
            return True

        idsSellers = [idSeller for idSeller in idsSellers if idSeller != auth.user_id]

        if len(set(idsSellers)) == 0:
            session.flash = "Error: You cant be the Seller and the Buyer"
            return True
        else:
            f.idSeller = idsSellers[0]

    def row_to_esdata(f):
        return {
            "category":f.get("category"),
            "idSeller":f.get("idSeller"),
            "title":f.get("title"),
            "description":f.get("description"),
            "tags":f.get("tags"),
            "availableQuantity":f.get("availableQuantity"),
            "isPublic":f.get("isPublic")
        }

    def after_insert_inventoryItem(f,i):
        indexer = ESIndexer(db)
        f.idSeller = auth.user_id
        
        data = row_to_esdata(f)
        indexer.index_item(i,data,False)

    def after_update_inventoryItem(s,f):
        indexer = ESIndexer(db)
        rows = s.select()
        for row in rows:
            data = row_to_esdata(f)
            indexer.index_item(row.id,data,True)

    db.inventoryItem._after_insert.append(after_insert_inventoryItem)
    db.inventoryItem._after_update.append(after_update_inventoryItem)

    db.purchaseOrder._before_insert.append(before_insert_purchaseOrder)
