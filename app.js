const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const { format, isValid } = require("date-fns");

const dbpath = path.join(__dirname, "todoApplication.db");

const app = express();
app.use(express.json());

let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server running at http://localhost:3000/");
    });
  } catch (error) {
    console.log(`Db Error:${error.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();

const hasPriorityandstatus = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};
const hasCategoryandstatus = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.status !== undefined
  );
};
const hasCategoryandPriority = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.priority !== undefined
  );
};
const hasCategory = (requestQuery) => {
  return requestQuery.category !== undefined;
};
const hasPriority = (requestQuery) => {
  return requestQuery.priority !== undefined;
};
const hasStatus = (requestQuery) => {
  return requestQuery.status !== undefined;
};

const resultsinthis = (dataObject) => {
  return {
    id: dataObject.id,
    todo: dataObject.todo,
    priority: dataObject.priority,
    status: dataObject.status,
    category: dataObject.category,
    dueDate: dataObject.due_date,
  };
};

const checkdatevalid = (dateis) => {
  return isValid(
    new Date(`${dateis.getFullYear()},${dateis.getMonth()},${dateis.getDate()}`)
  );
};
const checkdateformat = (dateis) => {
  return format(
    new Date(
      `${dateis.getFullYear()},${dateis.getMonth() + 1},${dateis.getDate()}`
    ),
    "yyyy-MM-dd"
  );
};
const listis = (optionsis) => {
  const liststatus = [
    "TO DO",
    "DONE",
    "IN PROGRESS",
    "WORK",
    "HOME",
    "LEARNING",
    "HIGH",
    "LOW",
    "MEDIUM",
  ];
  return liststatus.some((each) => each === optionsis);
};

app.get("/todos/", async (request, response) => {
  const { search_q = " ", status, priority, category } = request.query;
  let getquery = " ";
  let data = null;

  switch (true) {
    case hasPriorityandstatus(request.query):
      if (listis(priority)) {
        if (listis(status)) {
          getquery = `select * from todo where todo like '%${search_q}%' and priority = '${priority}' and status = '${status}';`;
          data = await database.all(getquery);
          response.send(data.map((eachis) => resultsinthis(eachis)));
        } else {
          response.status(400);
          response.send("Invalid Todo Status");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;

    case hasCategoryandstatus(request.query):
      if (listis(category)) {
        if (listis(status)) {
          getquery = `select * from todo where todo like '%${search_q}%' and category = '${category}' and status = '${status}';`;

          data = await database.all(getquery);
          response.send(data.map((eachis) => resultsinthis(eachis)));
        } else {
          response.status(400);
          response.send("Invalid Todo Status");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;

    case hasCategoryandPriority(request.query):
      if (listis(category)) {
        if (listis(priority)) {
          getquery = `select * from todo where todo like '%${search_q}%' and category = '${category}' and priority = '${priority}';`;

          data = await database.all(getquery);
          response.send(data.map((eachis) => resultsinthis(eachis)));
        } else {
          response.status(400);
          response.send("Invalid Todo Priority");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;

    case hasCategory(request.query):
      if (listis(category)) {
        getquery = `select * from todo where todo like '%${search_q}%' and category = '${category}';`;
        data = await database.all(getquery);
        response.send(data.map((eachis) => resultsinthis(eachis)));
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;

    case hasPriority(request.query):
      if (listis(priority)) {
        getquery = `select * from todo where todo like '%${search_q}%' and priority = '${priority}';`;

        data = await database.all(getquery);
        response.send(data.map((eachis) => resultsinthis(eachis)));
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;

    case hasStatus(request.query):
      if (listis(status)) {
        getquery = `select * from todo where todo like '%${search_q}%' and status = '${status}';`;

        data = await database.all(getquery);
        response.send(data.map((eachis) => resultsinthis(eachis)));
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
      break;

    default:
      getquery = `select * from todo where todo like '%${search_q}%';`;
      data = await database.all(getquery);
      response.send(data.map((eachis) => resultsinthis(eachis)));
      break;
  }
});

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const gettodoidquery = `
    select * from todo where id = ${todoId};`;
  const todoidis = await database.get(gettodoidquery);
  response.send(resultsinthis(todoidis));
});

app.get("/agenda/", async (request, response) => {
  const { date } = request.query;
  let newdateis = new Date(date);
  //console.log(newdateis);
  if (checkdatevalid(newdateis)) {
    const dateformat = checkdateformat(newdateis);
    //console.log(dateformat);
    const datedataquery = `
    select * from todo where due_date = '${dateformat}';`;
    const datawithdate = await database.all(datedataquery);
    response.send(datawithdate.map((each) => resultsinthis(each)));
  } else {
    response.status(400);
    response.send("Invalid Due Date");
  }
});

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status, category, dueDate } = request.body;
  if (listis(`${priority}`)) {
    if (listis(`${status}`)) {
      if (listis(`${category}`)) {
        let postdate = new Date(`${dueDate}`);
        if (checkdatevalid(postdate)) {
          let postdateis = checkdateformat(postdate);
          const postquery = `insert into todo (id,todo,priority,status,category,due_date)
                     values(${id},'${todo}','${priority}','${status}','${category}','${postdateis}');`;
          await database.run(postquery);
          response.send("Todo Successfully Added");
        } else {
          response.status(400);
          response.send("Invalid Due Date");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
    } else {
      response.status(400);
      response.send("Invalid Todo Status");
    }
  } else {
    response.status(400);
    response.send("Invalid Todo Priority");
  }
});

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const requestBody = request.body;
  let updateditem = " ";
  switch (true) {
    case requestBody.status !== undefined:
      updateditem = "Status";
      break;
    case requestBody.priority !== undefined:
      updateditem = "Priority";
      break;
    case requestBody.todo !== undefined:
      updateditem = "Todo";
      break;
    case requestBody.category !== undefined:
      updateditem = "Category";
      break;
    case requestBody.dueDate !== undefined:
      updateditem = "Due Date";
      break;
  }
  const previousvaluesquery = `select * from todo where id = ${todoId};`;
  const previousvalue = await database.get(previousvaluesquery);

  const {
    todo = previousvalue.todo,
    priority = previousvalue.priority,
    status = previousvalue.status,
    category = previousvalue.category,
    dueDate = previousvalue.due_date,
  } = request.body;

  if (listis(`${priority}`)) {
    if (listis(`${status}`)) {
      if (listis(`${category}`)) {
        let postdate = new Date(`${dueDate}`);
        if (checkdatevalid(postdate)) {
          let postdateis = checkdateformat(postdate);
          const updatedquery = `update todo set todo = '${todo}',status ='${status}',
            category = '${category}', priority ='${priority}',due_date ='${dueDate}' where id = ${todoId};`;
          await database.run(updatedquery);
          response.send(`${updateditem} Updated`);
        } else {
          response.status(400);
          response.send("Invalid Due Date");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
    } else {
      response.status(400);
      response.send("Invalid Todo Status");
    }
  } else {
    response.status(400);
    response.send("Invalid Todo Priority");
  }
});

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deletequery = `delete from todo where id = ${todoId};`;

  await database.run(deletequery);
  response.send("Todo Deleted");
});

module.exports = app;
