
--create the fk refrence based on the folders table and the id column
alter table notes
add column folder_id integer references folders(id);