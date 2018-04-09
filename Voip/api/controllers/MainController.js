var replace = require("replace");
var con = require("./connection.js");
var fs = require("fs");

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
  ModifyUsers(req,res){
    var f = true;
    var r = 'caquita';
    var str = '';

    con.connection.query("select * from user where id_user =" +req.param("sip"),function(err,userResult){
      if(err){
        console.log(err);
      }else{
        // str = "/["+req.param("sip")+"]/";
        str = `[`+req.param("sip")+`]
type=friend
secret=`+req.param("oldPassword")+`
host=dynamic
context=ext_internas
callerid="`+userResult[0].nombre+`"<`+req.param("sip")+`>
dtmfmode=rfc2833
qualify=yes`;
        if(req.param("oldPassword")==userResult[0].password){
          con.connection.query("UPDATE user set nombre ='"+req.param("user")+"', password ='"+req.param("password")+"' where id_user=" +req.param("sip"), function(err,result){
            if(err){
              console.log(err);
            }else{
              console.log(str);

              fs.readFile('../../../../../etc/asterisk/sip.conf','utf8', function(errr,data){
                if(errr){
                  console.log(errr);
                }
                var r =`[`+req.param("sip")+`]
type=friend
secret=`+req.param("password")+`
host=dynamic
context=ext_internas
callerid="`+req.param("user")+`"<`+req.param("sip")+`>
dtmfmode=rfc2833
qualify=yes`;
                var result = data.replace(str,r);
                fs.writeFile('../../../../../etc/asterisk/sip.conf',result,'utf8',function(err){
                  if(err) {
                    console.log(err);
                  }
                })
              });
              res.render('modificar',{error: "Modificado exitosamente"});
            }
          });
        }else{
          res.render('modificar',{error: "Contrasena incorrecta"});
        }
      }
    });




  },
  DeleteUser(req,res){

    con.connection.query("select * from user where id_user =" +req.param("sip"),function(err,userResult){
      if(err){
        console.log(err);
      }else{
        if(userResult[0].password==req.param("password")){
          con.connection.query("Delete from user where id_user ="+req.param("sip"),function(err,result){
            if(err){
              console.log(err);
            }else{
              fs.readFile('../../../../../etc/asterisk/sip.conf','utf8', function(errr,data){
                if(errr){
                  console.log(errr);
                }
                var str = `[`+req.param("sip")+`]
type=friend
secret=`+req.param("password")+`
host=dynamic
context=ext_internas
callerid="`+userResult[0].nombre+`"<`+req.param("sip")+`>
dtmfmode=rfc2833
qualify=yes`;
                var r ='';
                console.log(str);
                var result = data.replace(str,r);
                fs.writeFile('../../../../../etc/asterisk/sip.conf',result,'utf8',function(err){
                  if(err) {
                    console.log(err);
                  }
                });
                res.render('eliminar',{error: "Usuario eliminado"});
            });
          }
        });
      }else{
          res.render('eliminar',{error: "Contrasena incorrecta"});
        }
      }
    });


  }



} //module.exports end
