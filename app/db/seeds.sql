

USE My_Mobi_Linq_db;



INSERT INTO users ( name, email_hash, password_hash, account_id, is_this_master_for_acct )  VALUES ( "richbu1", '0260d8a4f51548dcb386abf34fc0c4d2796675', '$2a$10$pmISu/psE8Hung8AUGrrvOMj9D1NOpxUCrCvZjyK1DEWTlA.p93fu', 1, TRUE );

INSERT INTO users ( name, email_hash, password_hash, account_id, is_this_master_for_acct )  VALUES ( "richbu2", '0260d8a4f5153884edb2a1ff47c5869f7564', '$2a$10$pmISu/psE8Hung8AUGrrvOMj9D1NOpxUCrCvZjyK1DEWTlA.p93fu', 2, TRUE );


INSERT INTO administrators ( adminName_hash, email_hash, password_hash )  VALUES ( "0260d8a4f515", '0260d8a4f51548dcb386abf34fc0c4d2796675', '$2a$10$.r6wj8jPAVNTu4gKpIOk4.w8KM9wm3KWQC1dXyvCBikDlN7kFzpRi' );


INSERT INTO user_account ( max_upload_allow, curr_num_uploads, max_device_allow, max_file_size_allow, max_numPics_per_session, date_acct_expire, isActive, allowEmail, wantsEmailToUser, wantsEmailToMaster ) VALUES (
    10,
    0,
    3,
    500000000,
    5,
    0,
    TRUE,
    TRUE,
    FALSE,
    FALSE
);


INSERT INTO user_account ( max_upload_allow,  
curr_num_uploads, 
max_device_allow, 
max_file_size_allow, 
max_numPics_per_session, 
date_acct_expire, 
isActive, 
allowEmail, 
wantsEmailToUser, 
wantsEmailToMaster ) VALUES (
    10,
    0,
    3,
    500000000,
    5,
    0,
    TRUE,
    TRUE,
    FALSE,
    FALSE
);


INSERT INTO audit_log ( typeRec, time_stamp, user_name, user_email, fault, browser_id, ip_addr ) 
VALUES (
    "INIT FILES",
    0,
    "Admin",
    "Admin@root.com",
    "successful",
    " ",
    " "
)

