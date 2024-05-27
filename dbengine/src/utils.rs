use actix::{Actor,SyncContext,Addr};
use diesel::{
    r2d2::{ConnectionManager,Pool},
    PgConnection
};
pub type PGConnectionMgr = ConnectionManager<PgConnection>;
pub type PGPool = Pool<PGConnectionMgr>;

pub struct DbActor(pub PGPool);
impl Actor for DbActor{
    type Context = SyncContext<Self>;
}
pub struct DbState{
    pub db:Addr<DbActor>
}

pub fn get_pool(dburl:&str)->PGPool{
    let manager = PGConnectionMgr::new(dburl);
    Pool::builder().build(manager).expect("Failed to create pool")
}

