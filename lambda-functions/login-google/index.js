const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: process.env.DIALECT,
  host: process.env.HOST,
  database: process.env.DATABASE,
  port: process.env.PORT,
  username: process.env.TSNET_DB_USER,
  password: process.env.PASSWORD,
});

exports.handler = async (event, context) => {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");

    const token = event.queryStringParameters.token;
    
    // UserInfos von Google abholen
    const urlGoogleApi = `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${token}`;
    let res = await fetch(urlGoogleApi);
    res = await res.json();

    let response;
    if (res.id) {
      // ALLES SUPER, wir haben die Infos nach Schema
      console.log("GOOGLE-SUCCESS: " + JSON.stringify(res));

      // Nutzer hinzufügen
      await sequelize.query(`
        INSERT INTO User (UserID, RealName, EmailAddress, BirthDate, Course, AuthProvider, ProfileImg)
        VALUES ('${res.id}', '${res.name}', '${res.email}', null, null, null, '${res.picture}')
        ON DUPLICATE KEY UPDATE
          UserID = VALUES(UserID),
          RealName = VALUES(RealName),
          BirthDate = VALUES(BirthDate),
          Course = VALUES(Course),
          AuthProvider = VALUES(AuthProvider),
          ProfileImg = VALUES(ProfileImg);
      `);

      const [results, metadata] = await sequelize.query("SELECT * FROM User");
      console.log(results);

      response = {
        statusCode: 200,
        body: JSON.stringify(res),
      };
    } else {
      // FAIL, Auth-Prozess gescheitert
      console.log("GOOGLE-ERROR: " + JSON.stringify(res));
      response = {
        statusCode: 401,
        body: JSON.stringify({
          message: "Error while Authenticating. Please retry.",
        }),
      };
    }

    return response;
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Internal Server Error",
      }),
    };
  }
};
