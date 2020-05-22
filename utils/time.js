export default {
  timeConvert(timestamp){//timestamp:时间戳 
    var date = new Date(timestamp);
		var Y = date.getFullYear() + '.';
		var M = (date.getMonth()+1 < 10 ? +(date.getMonth()+1) : date.getMonth()+1);
		var mon_arr = ["January","February","March","April","May","June","July","August","September","October","November","December"];  //英文月份
		M = mon_arr[M] + '.'
		var D = (date.getDate() < 10 ? '0' + (date.getDate()) : date.getDate());
		if(D === '01'){
			D = D +'st  '
		} else if(D === '02'){
			D = D + 'nd  '
		} else if(D === '03'){
			D = D + 'rd  '
		} else {
			D = D + 'th  '
		}
		var h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':';
		var m = (date.getMinutes() <10 ? '0' + date.getMinutes() : date.getMinutes()) + ':';
		var s = (date.getSeconds() <10 ? '0' + date.getSeconds() : date.getSeconds());
		return Y+M+D+h+m+s;
  }
}
