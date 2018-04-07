const express = require('express');
const app =express();

app.get('/',(req,res)=>{
	res.send({hey:"bye"})
})

app.listen(5000);