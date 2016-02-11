$(function(){
  $("#header__icon").click(function(event){
    event.preventDefault();
    $('body').toggleClass('with__sidebar');
  });
});
