const express = require('express');
const authRoutes=require('./routes/authRoutes')
require('./models/User')
require('./models/Survey')
const passportConfig= require('./services/passport')
const app =express();
const mongoose=require('mongoose')
const cookieSession=require('cookie-session');
const passport=require('passport');
const keys=require('./config/keys');
const bodyParser=require('body-parser');

app.use(bodyParser.json())

app.use(
	cookieSession({
		maxAge:30*24*60*60*1000,
		keys:[keys.cookieKey]
	})

)

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(keys.mongoURI);
authRoutes(app);
require('./routes/billingRoutes')(app);
require('./routes/surveyRoutes')(app);




app.listen(5000);