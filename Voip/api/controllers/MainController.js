var replace = require("replace");
var con = require("./connection.js");

module.exports = {
  _config: {
  		actions:false,
  		shortcuts:false,
  		rest:false
  	},
  Usuarios(req,res)
  {
    con.connection.query('select * from user ',function(err,result)
    {
      if(err){
        res.end(err);
      }else{
        res.render('historial',{datos: result});
        }
    });
  },
  AddUser(req,res){
    var user = req.param('user');
    var password = req.param('password');
    var numero = 0;
    var r="";
    var q="";
    con.connection.query("insert into user (nombre,password) values ('"+user+"','"+password+"')", function(err,result){
      if(err){
        console.log("Error: " + err);
      }else{
        console.log(result);
        con.connection.query("Select max(id_user) as id_user from user",function(er,ress){
          if(err){
            console.log(er);
          }else{
            numero = ress[0].id_user;
            r = `[`+numero+`]
type=friend
secret=`+password+`
host=dynamic
context=ext_internas
callerid="`+user+`"<`+numero+`>
dtmfmode=rfc2833
qualify=yes

#nuf88
        `;
       q = `exten => `+numero+`,1,Dial(SIP/`+numero+`)
same =>n,Hangup()

#nuf88`;

    var str = "#nuf88";

    replace({
      regex: str,
      replacement: r,
      paths: ['../../../../../etc/asterisk/sip.conf'],
      recursive:true,
      silent:true,
    });
    replace({
      regex: str,
      replacement: q,
      paths: ['../../../../../etc/asterisk/extensions.conf'],
      recursive:true,
      silent:true,
    });
          }
        });
      }
    });


    res.render('homepage');
  },
  GetUsers(req,res){
    var tabla ="a";
  }



} //module.exports end
