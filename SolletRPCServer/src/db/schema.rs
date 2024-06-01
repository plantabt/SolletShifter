
// @generated automatically by Diesel CLI.

diesel::table! {
    account (id, privatekey) {
        id -> Int4,
        name -> Text,
        privatekey -> Text,
        phrase -> Nullable<Text>,
        create_time -> Timestamptz,
        modify_time -> Timestamptz,
        create_ip -> Text,
        login_time -> Nullable<Timestamptz>,
        login_ip -> Nullable<Text>,
    }
}

diesel::table! {
    subaccount (id) {
        id -> Int4,
        account -> Jsonb,
        owner -> Text,
        create_time -> Timestamptz, 
        privatekey -> Text,
    }
}

diesel::allow_tables_to_appear_in_same_query!(
    account,
    subaccount,
);
