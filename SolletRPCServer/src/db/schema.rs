// @generated automatically by Diesel CLI.

diesel::table! {
    account (id) {
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
