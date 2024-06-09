
use crate::db::subaccount::models::{SubAccount};
use chrono::{DateTime, Utc};
use dbengine::utils::DbActor;
use serde_json::json;
use sha2::digest::block_buffer::Error;

use crate::db::schema::subaccount::dsl::*;

use actix::Handler;
use diesel::{self,prelude::*};

use super::message::{DelSubAccountMsg, FetchSubAccountMsg, FetchSubAccountsMsg, InsSubAccount, UpdateSubAccountMsg};
use super::models::{DelSubAccountMod, InsertSubAccountMod, UpdateSubAccountMod};

impl Handler<FetchSubAccountsMsg> for DbActor{
    type Result = QueryResult<Vec<SubAccount>>;

    fn handle(&mut self, _msg: FetchSubAccountsMsg, _ctx: &mut Self::Context)->Self::Result{
        let mut conn = self.0.get().expect("couldn't get db connection from pool");
        subaccount.filter(owner.eq(_msg.owner)).get_results::<SubAccount>(&mut conn)
    }
}

impl Handler<FetchSubAccountMsg> for DbActor{
    type Result = QueryResult<SubAccount>;

    fn handle(&mut self, _msg: FetchSubAccountMsg, _ctx: &mut Self::Context)->Self::Result{
        let mut conn = self.0.get().expect("couldn't get db connection from pool");
        subaccount.filter(owner.eq(_msg.owner)).get_result::<SubAccount>(&mut conn)
    }
}

impl Handler<InsSubAccount> for DbActor{
    type Result = QueryResult<usize>;

    fn handle(&mut self, _msg: InsSubAccount, _ctx: &mut Self::Context)->Self::Result{
        let mut conn = self.0.get().expect("couldn't get db connection from pool");
        let result = conn.transaction::<_,diesel::result::Error,_>(|conn|{
            diesel::insert_into(subaccount).values(InsertSubAccountMod{
                account:_msg.account.clone(),
                owner:_msg.owner,
                create_time: Utc::now(),
                privatekey:_msg.privatekey,
            }).execute(conn)/*.returning((owner,account,create_time))
            .get_result::<InsertSubAccount>(conn)
             */
        });
        result

    }
}

impl Handler<DelSubAccountMsg> for DbActor{
    type Result = QueryResult<usize>;
    fn handle(&mut self, _msg: DelSubAccountMsg, _ctx: &mut Self::Context)->Self::Result{
        let mut conn = self.0.get().expect("couldn't get db connection from pool");
        let result = conn.transaction::<_,diesel::result::Error,_>(|conn|{
            diesel::delete(subaccount.filter(owner.eq(_msg.owner).and(privatekey.eq(_msg.privatekey)))).execute(conn)
        });
        result

    }
}

impl Handler<UpdateSubAccountMsg> for DbActor{
    type Result = QueryResult<usize>;
    fn handle(&mut self, _msg: UpdateSubAccountMsg, _ctx: &mut Self::Context)->Self::Result{
        let mut conn = self.0.get().expect("couldn't get db connection from pool");
        let result = conn.transaction::<_,diesel::result::Error,_>(|conn|{

            /*
            if let Ok(subaccountr) = subaccount.filter(owner.eq(_msg.owner.clone()).and(privatekey.eq(_msg.privatekey.clone()))).get_result::<SubAccount>(conn){
                subaccountr.account.as_object().unwrap().get("name").unwrap().as_str().unwrap().to_string();
            }
             */
            diesel::update(subaccount.filter(owner.eq(_msg.owner).and(privatekey.eq(_msg.privatekey)))).set(account.eq(_msg.account)).execute(conn)
        });
        result

    }
}
