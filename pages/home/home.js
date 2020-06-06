// pages/search/search.js
const myaudio = wx.createInnerAudioContext();
Page({

  /**
   * 页面的初始数据
   * https://music.yadzxf.com/top/list?idx=1
   * 获取榜单详情
   */
  data: {
    listrotate: '', //列表旋转
    lastTapTime:0, //当前点击时间戳
    songlist:[],//排行榜列表
    index: -1,
    indexp: -1,
    requestdata:true, //是否可以请求歌单详情
    songdetaile:[], //榜单歌曲列表
    audKey: '', //当前选中的音频key
    songtext: '', //歌词
    activeIndex: 0, //控制高亮
    scrolltop: 0, //滚动距离
    currentTime: 0, //当前播放时间
    boxopen: ''
  },
  // 打开歌单
  boxopen(e){
    var that = this
    var tapTime = e.timeStamp //获取时间戳
    var lastTime = this.data.lastTapTime; //第一次获取为零
    var songindex = e.currentTarget.dataset.key;
    if(tapTime - lastTime < 250){
      this.setData({
        index:-1,
        requestdata: true, // 退出后重新获得请求权限
        listrotate: '',
        boxopen: 'box-open'
      })
    } else {
      if(this.data.requestdata){
        wx.request({
          url: 'https://music.yadzxf.com/top/list?idx='+songindex,
          success(res){
            // console.log(res.data.playlist.tracks)
            var arr = that.arr(res.data.playlist.tracks)
            that.setData({
              requestdata: false, //请求一次后锁住，不在请求
              songdetaile: arr
            })
          }
        })
      }
      this.setData({
        index: e.currentTarget.dataset.key,
        listrotate: 'transform: rotate(0deg)',
        boxopen: ''
      })
    }
    this.setData({
      lastTapTime: tapTime,
    })
  },
  //播放按钮
  playbtn(e){
    this.setData({
      indexp: e.currentTarget.dataset.key
    })
    var that = this,
      key = e.currentTarget.dataset.key,
      audioArr = that.data.songdetaile;
    //设置状态
    audioArr.forEach((v, i, array) => {
      v.bl = false;
      if (i == key) {
        v.bl = true;
      }
    })
    that.setData({
      songdetaile: audioArr,
      audKey: key,
    })
    //开始播放
    myaudio.autoplay = true;
    var audKey = that.data.audKey,
    vidSrc = `https://music.163.com/song/media/outer/url?id=${audioArr[audKey].id}.mp3`;
    //获取歌词
    this.lrc(audioArr[audKey].id);
    myaudio.src = vidSrc;
    myaudio.play();
    myaudio.onPlay(() => {
      // console.log('开始播放');
    })
    
    //获取歌词滚动时间
    myaudio.onTimeUpdate(() => {
      // console.log('进度更新了总进度为：' + myaudio.duration + '当前进度为：' + myaudio.currentTime);
      var min = parseInt(myaudio.currentTime / 60);
      var sec = parseInt(myaudio.currentTime % 60);
      var value = myaudio.currentTime / myaudio.duration*100
      if (min.toString().length == 1) {
        min = `0${min}`;
      }
      if (sec.toString().length == 1) {
        sec = `0${sec}`;
      }
      var time = `${min}:${sec}`;
      // console.log(value + time)
      this.setData({
        currentTime: time,
        // scrolltop:value
      })
      this.timeup();
    })

    //获取音乐时间长度
    this.du(key);


    //结束监听
    myaudio.onEnded(() => {
      // console.log('自动播放完毕');
      audioArr[key].bl = false;
      that.setData({
        songdetaile: audioArr,
      })
    })
    //错误回调
    myaudio.onError((err) => {
      console.log(err);
      audioArr[key].bl = false;
      that.setData({
        songdetaile: audioArr,
      })
      return
    })
  },
  //停止按钮
  pausebtn(e){
    this.setData({
      indexp: -1
    })
    var that = this,
      audioArr = that.data.songdetaile;
    //设置状态
    audioArr.forEach((v, i, array) => {
      v.bl = false;
    })
    that.setData({
      songdetaile: audioArr,
    })
    //音乐停止
    myaudio.stop();
    //停止监听
    myaudio.onStop(() => {
      // console.log('停止播放');
    })
  },
  // 获取音乐时长
  du(key) {
    myaudio.onCanplay(() => {
      myaudio.duration
    });
  },
  // 数组精简方法
  arr(arr){
    var newarr = [];
    for(var i=0;i<5;i++){
      newarr.push(arr[i])
    }
    let array = [];
    newarr.map((item,index)=>{
      array.push(
         Object.assign(item,{bl:false})
        )
      });
    // console.log(array);    
    // console.log(newarr)
    return array
  },
  //获取歌词
  lrc(id){
    var that = this
    wx.request({
      url: 'https://music.yadzxf.com/lyric?id='+id,
      success(res){
        // console.log(res.data.lrc.lyric)
        var arr = res.data.lrc.lyric.split("[")
        arr = arr.map(r => {
          // 去除每一项的空格很重要，不然后面设置当前项是空格的，上一项不是空格仍然高亮不起作用
          var arr1 = r.trim().substr(0,5).split("]")
          var arr2 = r.trim().substr(1).split("]")
          // console.log(arr1)
          return {
            time: arr1[0],
            text: arr2[1]
          }
        })
        // console.log(arr)
        that.setData({
          songtext: arr
        })
      }
    })
  },
  //控制歌词滚动
  timeup() {
    for (var i = 0; i < this.data.songtext.length; i++) {
      // 当前播放时间等于数组time时activeIndex才改变值
      // console.log(this.data.currentTime == this.data.songtext[i].time);
      
      if (this.data.currentTime == this.data.songtext[i].time) {
        // 当activeIndex不等于i时更新，当songtext有值为空格时也不更新
        if (this.data.activeIndex !== i && this.data.songtext[i].text) {
          this.setData({
            activeIndex: i,
            scrolltop: 50 * (i - 3)
          })
          if (i > 3) {
            this.setData({
              // 此处的滚动距离可以为高度*i,到第5行在进行滚动
              scrolltop: 30 * (i - 3)
            })
          }
          break
        }
      }
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var arr = [];
    wx.request({
      url: 'https://music.yadzxf.com/toplist',
      success(res){
        for(var i=0;i<10;i++){
          arr.push(res.data.list[i])
        }
        // console.log(arr)
        // console.log(res.data.list)
        that.setData({
          songlist: arr
        })
      }
    })
  },
  onShow: function(){
    this.setData({
      boxopen: 'box-open'
    })
  },
    /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    this.setData({
      boxopen: ''
    })
  },
})