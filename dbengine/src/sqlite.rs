use std::{ path::Path, ptr::null};

use rusqlite::{params, Connection};

pub fn open(dbfilepath:&str) -> Result<Connection,rusqlite::Error>{
  let conn = Connection::open(dbfilepath)?;
  Ok(conn)
}
pub fn close(conn:Connection){
  conn.close().expect("close db error");
}

pub fn create_db(dbfilepath:&str) -> Result<(),rusqlite::Error>{
  
  if Path::new(dbfilepath).exists(){
    return Ok(());
  }
  // create database
  let conn = Connection::open(dbfilepath).unwrap();

  // Now we can execute a query to create a table
  conn.execute(
      "CREATE TABLE IF NOT EXISTS account (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL UNIQUE,
                                                privatekey TEXT NOT NULL,
                                                phrase TEXT,
                                                name TEXT NOT NULL,
                                                createtime TEXT DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
                                                createip TEXT NOT NULL);

      )",
      params![],
  )?;

  Ok(())
}