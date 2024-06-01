
use crate::db::subaccount::models::{SubAccount};
use chrono::{DateTime, Utc};
use dbengine::utils::DbActor;
use sha2::digest::block_buffer::Error;

use crate::db::schema::subaccount::dsl::*;

use crate::db::subaccount::message::{FetchSubAccount,InsSubAccount};
use actix::Handler;
use diesel::{self,prelude::*};

use super::models::InsertSubAccount;

impl Handler<FetchSubAccount> for DbActor{
    type Result = QueryResult<Vec<SubAccount>>;

    fn handle(&mut self, _msg: FetchSubAccount, _ctx: &mut Self::Context)->Self::Result{
        let mut conn = self.0.get().expect("couldn't get db connection from pool");
        subaccount.filter(owner.eq(_msg.owner)).get_results::<SubAccount>(&mut conn)
    }
}


impl Handler<InsSubAccount> for DbActor{
    type Result = QueryResult<usize>;

    fn handle(&mut self, _msg: InsSubAccount, _ctx: &mut Self::Context)->Self::Result{
        let mut conn = self.0.get().expect("couldn't get db connection from pool");
        let result = conn.transaction::<_,diesel::result::Error,_>(|conn|{
            diesel::insert_into(subaccount).values(InsertSubAccount{
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
