const nodemailer = require('nodemailer')


const emailTransporter = nodemailer.createTransport({
    service: "gmail",
    secure:true,
    auth: {
      user: "developer.sushil.khadka@gmail.com",
      pass: process.env.GMAIL_AUTH_PASSWORD
    },
  });


const welcomeEmail = (email,name)=>{

    emailTransporter.sendMail({

        from: 'Sushil Khadka <sushil.khadka.anon@gmail.com',
        to: email,
        subject: 'Welcome! Thanks For joining us. ',
        text: `Hi, ${name}. Let us know how things go with our app.`,

    },(err, info)=>{
        if(err){
            console.log('Error:    '+err)
        }else{
            console.log('Email sent: '+ info.response)
        }
    } )
}

const cancelEmail = (email,name)=>{

    emailTransporter.sendMail({

        from: 'Sushil Khadka <developer.sushil.khadka@gmail.com',
        to: email,
        subject: 'GoodBye! ',
        text: `Hi, ${name}. Is there anything that we could have done to keep you onboard?`,

    },(err, info)=>{
        if(err){
            console.log('Error:    '+err)
        }else{
            console.log('Email sent: '+ info.response)
        }
    } )
}


module.exports ={
    welcomeEmail,
    cancelEmail
}