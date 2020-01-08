var user={
  me:{image:'assets/img/me.png',name:'Me',message:''},
  bot:{image:'assets/img/bot.png',name:'BOT',message:''},
}
var config={
  template:{
    showTime:false,
  },
  chat:{
    fastResponse:false,
  }
}
var template={
  sender:function(data){
    var html = '';
    html+='<li class="right clearfix">';
    html+='  <span class="chat-img pull-right">';
    html+='    <img src="'+data.image+'" alt="User Avatar" class="img-circle">';
    html+='  </span>';
    html+='  <div class="chat-body clearfix">';
    html+='    <div class="header">';
    if(config.template.showTime){
      html+='      <small class=" text-muted">';
      html+='        <span class="glyphicon glyphicon-time"></span>'+getCurrentTime();
      html+='      </small>';
    }
    html+='      <strong class="pull-right primary-font">'+data.name+'</strong>';
    html+='    </div>';
    html+='    <p>';
    html+='      '+data.message;
    html+='    </p>';
    html+='  </div>';
    html+='</li>';
    return html;
  },
  receiver:function(data){
    var html='';
    html+='<li class="left clearfix">';
    html+='  <span class="chat-img pull-left">';
    html+='    <img src="'+data.image+'" alt="User Avatar" class="img-circle">';
    html+='  </span>';
    html+='  <div class="chat-body clearfix">';
    html+='    <div class="header">';
    html+='      <strong class="primary-font">'+data.name+'</strong>';
    if(config.template.showTime){
      html+='      <small class=" text-muted">';
      html+='        <span class="glyphicon glyphicon-time"></span>'+getCurrentTime();
      html+='      </small>';
    }
    html+='    </div>';
    html+='    <p>';
    html+='      '+data.message;
    html+='    </p>';
    html+='  </div>';
    html+='</li>';
    return html;
  },
}
var nextQuestionTimeout=3000, intervalNQT=0,BreakException={};
var questions = [
  {
    question_id:1,
    text:["Hi", "Hey", "Halo", "Hey"],
    answer_id:1,
    nextAnswerId:0,
    prefix:true,
    postfix:true,
    behaviour:false,
    uniqueAnswer:true,
  },{
    question_id:1,
    text:["What","Whats"],
    answer_id:2,
    nextAnswerId:0,
    prefix:true,
    postfix:true,
    behaviour:false,
    uniqueAnswer:true,
  }
];
questions.forEach(function(v,k){
  var pattern = '';
  if(v.prefix){
    pattern+="^.*?";
  }
  pattern+="("+v.text.join('|').toLowerCase()+")";
  if(v.postfix){
    pattern+='.*$';
  }
  questions[k].regex = new RegExp(pattern,"i");
})
var answer = [
  {
    answer_id:1,
    list:[
      {
        hit:0,
        text:"Ohh hello",
      },{
        hit:0,
        text:"It's me",
      }
    ]
  },{
    answer_id:2,
    list:[
      {
        hit:0,
        text:"I don't know",
      },{
        hit:0,
        text:"I want say something",
      }
    ]
  }
];
var excludeAnswer = [
  'I dont understand what do you want?',
  'Sorry, what?'
];
function renewSearchTime(){
  if(config.chat.fastResponse){
    return 100;
  }else{
    return Math.floor((Math.random()*500)+1000);
  }
}
function get_unique_answer(index){
  var temp = 1000000,id=-1;
  answer[index].list.forEach(function(v,k){
    if(v.hit<temp){
      temp=v.hit;
      id=k;
    }
  })
  answer[index].list[id].hit++;
  return answer[index].list[id].text;
}
function get_answer(answer_id){
  return new Promise(resolve=>{
    var answerIndex = answer.map(function(x){return x.answer_id}).indexOf(answer_id);
    var result='';
    if(answer[answerIndex].uniqueAnswer){
      result=(get_unique_answer(answerIndex))
    }else{
      result=(get_unique_answer(answerIndex))
    }
    resolve(result)
  });
}
function timeout(ms){
  return new Promise(resolve=>setTimeout(resolve,ms));
}
async function match_answer(keyword){
  await timeout(renewSearchTime());
  keyword = keyword.toLowerCase()
  return await new Promise(async function(resolve,reject){
    await timeout(renewSearchTime());
    var curr_answer = '', flag=false;
    questions.forEach(function(v,k){
      if(v.regex.test(keyword)){
        curr_answer = get_answer(v.answer_id);
        flag=true;
        resolve(curr_answer);
      }
      if(flag){return;}
    })
    if(flag){return;}
    curr_answer=excludeAnswer[Math.floor(Math.random()*excludeAnswer.length)];
    resolve(curr_answer)
  })
}
$('#input-message').on('keyup',function(e){
  var key = e.keyCode||e.which;
  if(!(e.ctrlKey||e.shiftKey)&&key==13){
    search()
  }
})
async function search(){
  user.me.message = $('#input-message').val();
  $('#input-message').val('');
  $('#chat').append(template.sender(user.me))
  $('.loading-animation').show()
  $('.panel-body').get(0).scrollTop = $('.panel-body').height();
  user.bot.message = await match_answer(user.me.message);
  $('.loading-animation').hide()
  $('#chat').append(template.receiver(user.bot))
  $('.panel-body').get(0).scrollTop = $('.panel-body').height();
}
function clearChat(){
  $('#chat').html('');
}
function loadDataJSON(){
  $.getJSON('data-answer.json',function(data){
    if(data.length>0){
      answer = data;
    }
  });
  $.getJSON('data-question.json',function(data){
    if(data.length>0){
      questions = data;
      questions.forEach(function(v,k){
        var pattern = '';
        if(v.prefix){
          pattern+="^.*?";
        }
        pattern+="("+v.text.join('|').toLowerCase()+")";
        if(v.postfix){
          pattern+='.*$';
        }
        questions[k].regex = new RegExp(pattern,"i");
      })
    }
  });
}
