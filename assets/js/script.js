
var nextQuestionTimeout=3000, intervalNQT=0,BreakException={};
var questions = [];
var answer = [];
var excludeAnswer = [
  'I dont understand what do you want?',
  'Sorry, what?'
];
var user={
  me:{image:'assets/img/me.png',name:'Me',message:''},
  bot:{image:'assets/img/bot.png',name:'BOT',message:''},
}
var config={
  template:{
    showTime:true,
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

function timeout(ms){
  return new Promise(resolve=>setTimeout(resolve,ms));
}
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
async function match_answer(keyword){
  $('.loading-animation').show()
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
        $('.loading-animation').hide()
      }
      if(flag){return;}
    })
    if(flag){return;}
    curr_answer=excludeAnswer[Math.floor(Math.random()*excludeAnswer.length)];
    resolve(curr_answer)
    $('.loading-animation').hide()
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
  $('.panel-body').get(0).scrollTop = $('.panel-body').height();
  user.bot.message = await match_answer(user.me.message);
  $('#chat').append(template.receiver(user.bot))
  $('.panel-body').get(0).scrollTop = $('.panel-body').height();
}
function clearChat(){
  $('#chat').html('');
}
function getCurrentTime(){
  var date = new Date();
  var year = date.getFullYear();
  var month = date.getMonth()+1;
  var day = date.getDate();
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var seconds = date.getSeconds();
  year = year.toString().padStart(4,0);
  month = month.toString().padStart(2,0);
  day = day.toString().padStart(2,0);
  hours = hours.toString().padStart(2,0);
  minutes = minutes.toString().padStart(2,0);
  seconds = seconds.toString().padStart(2,0);
  return year+'-'+month+'-'+day+' '+hours+':'+minutes+':'+seconds;
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
        var pattern = '^';
        if(v.prefix){
          pattern+=".*?";
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
loadDataJSON()