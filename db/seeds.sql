INSERT INTO department (name)
VALUES
    ('Human Resources'),
    ('Stow'),
    ('Pick'),
    ('AFM'),
    ('Ship Dock');


INSERT INTO role (title, salary, department_id)
VALUES
    ('Associate',47000,3),
    ('Area Manager',62500,2),
    ('HR Manager',77000,1),
    ('Operations Manger',93000,4),
    ('Senior Manager',110000,5);
    


INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES
    ('Aziz','Kabia',2,3),
    ('Kurtis','Backs',5,NULL),
    ('Maira','Ochoa',4,2),
    ('Tommy','Gonzales',1,1),
    ('Jabray','Cline',3,NULL);


/* Above are my inserts for my tabels I will be using as a pre display for development.