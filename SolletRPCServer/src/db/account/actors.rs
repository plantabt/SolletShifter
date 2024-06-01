
use crate::db::account::models::{Account, CreateAccount, UpdateLoginDb};
use chrono::{DateTime, Utc};
use dbengine::utils::DbActor;
use sha2::digest::block_buffer::Error;

use crate::db::schema::account::dsl::*;

use crate::db::account::message::{EstablishAccount, FetchAccount, UpdateLoginMsg};
use actix::Handler;
use diesel::{self,prelude::*};

impl Handler<FetchAccount> for DbActor{
    type Result = QueryResult<Vec<Account>>;

    fn handle(&mut self, _msg: FetchAccount, _ctx: &mut Self::Context)->Self::Result{
        let mut conn = self.0.get().expect("couldn't get db connection from pool");
        account.filter(privatekey.eq(_msg.privatekey)).get_results::<Account>(&mut conn)
    }
}


impl Handler<EstablishAccount> for DbActor{
    type Result = QueryResult<Account>;

    fn handle(&mut self, _msg: EstablishAccount, _ctx: &mut Self::Context)->Self::Result{
        let mut conn = self.0.get().expect("couldn't get db connection from pool");
        let result = conn.transaction::<_,diesel::result::Error,_>(|conn|{
            diesel::insert_into(account).values(CreateAccount{
                name:_msg.name.clone(),
                privatekey:_msg.privatekey.clone(),
                create_time:Utc::now(),
                modify_time:Utc::now(),
                phrase:_msg.phrase.clone(),
                create_ip:_msg.create_ip.clone(),
            }).returning((id,name,privatekey,phrase,create_time,modify_time,create_ip,login_time,login_ip))
            .get_result::<Account>(conn)
        });
        result

    }
}

impl Handler<UpdateLoginMsg> for DbActor{
    type Result = QueryResult<UpdateLoginDb>;

    fn handle(&mut self, _msg: UpdateLoginMsg, _ctx: &mut Self::Context) -> Self::Result {
        let mut conn = self.0.get().expect("couldn't get db connection from pool");
        let result = conn.transaction(|conn| {
            let target = account.filter(privatekey.eq(_msg.privatekey.clone()));
            diesel::update(target)
                .set((login_ip.eq(_msg.login_ip.clone()), login_time.eq(_msg.login_time.clone())))
                .returning((name,privatekey,login_time,login_ip))
                .get_result::<UpdateLoginDb>(conn)
                //.execute(conn)

        });
        result
    }
}