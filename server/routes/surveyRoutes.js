const mongoose=require('mongoose');

const requireLogin = require('../middlewares/requireLogin')
const requireCredits=require('../middlewares/requireCredits')
const Mailer =require('../services/Mailer');
const surveyTemplate=require('../services/emailTemplates/surveyTemplate')
const _ =require('lodash');
const Path=require('path-parser');
const {URL}=require('url')


const Survey=mongoose.model('surveys');
console.log(Path);

module.exports=app=>{
	app.get('/api/surveys',requireLogin,async (req,res)=>{
		const surveys=await Survey.find({_user:req.user.id}).select({
			recipients:false
		});
		res.send(surveys);
	})
	app.get('/api/surveys/:surveyId/:choice',(req,res)=>{
		res.send("Thanks for the feedback");
	})

	app.post('/api/surveys/webhooks',(req,res)=>{
		const events=_.map(req.body,({email,url})=>{
			const pathname = new URL(url).pathname;
			const p=new Path('/api/surveys/:surveyId/:choice');
			const match=p.test(pathname);
			if(match){
				return {email,surveyId:match.surveyId,choice:match.choice};
			}	
		})
		const compactEvents = _.compact(events);
		const uniqueEvents = _.uniqBy(compactEvents,'email','surveyId');
		console.log(uniqueEvents);
		uniqueEvents.forEach(event=>{
			Survey.updateOne({
    			_id: event.surveyId,
    			recipients: {
        			$elemMatch: { email: event.email, responded: false }
    			}

			}, {

    			$inc: {[event.choice]: 1 },
    			$set: { 'recipients.$.responded': true }

			}).exec();
		})
		res.send({});
	})
	app.post('/api/surveys',requireLogin,requireCredits,async (req,res)=>{
		const {title,subject,body,recipients}=req.body;
		const survey=new Survey({
			title,
			subject,
			body,
			recipients:recipients.split(',').map(email=>({email:email.trim()})),
			_user:req.user.id,
			dateSent:Date.now()
		})

		const mailer=new Mailer(survey,surveyTemplate(survey));
		try{
			await mailer.send();
			await survey.save();
			req.user.credits-=1;
			const user= await req.user.save();
			res.send(user);
		}catch(err){
			res.status(422).send(err);
		}
	})
}