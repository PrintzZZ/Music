// pages/detail.js
const myaudio = wx.createInnerAudioContext();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    song:[],
    id:'',
    playflag: false,
    songtext: '', //歌词
    activeIndex: 0, //控制高亮
    scrolltop: 0, //滚动距离
    currentTime: 0, //当前播放时间
  },
  //播放按钮
  playbtn(){
    var that=this;
    var id = this.data.id
    this.setData({
      playflag:true
    })
    console.log('播放') 
    //开始播放
    myaudio.autoplay = true;
    var vidSrc = `https://music.163.com/song/media/outer/url?id=${id}.mp3`;
    
    myaudio.src = vidSrc;
    myaudio.play();
    myaudio.onPlay(() => {
      // console.log('开始播放');
    })

    //结束监听
    myaudio.onEnded(() => {
      that.setData({
        playflag:false
      })
    })
    
    //错误回调
    myaudio.onError((err) => {
      console.log(err);
      return
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
    this.du();


  },
  // 停止按钮
  pausebtn(){
    var that=this;
    this.setData({
      playflag:false
    })
    //音乐停止
    myaudio.stop();
    //停止监听
    myaudio.onStop(() => {
      // console.log('停止播放');
    })
  },
  // 获取音乐时长
  du() {
    myaudio.onCanplay(() => {
      myaudio.duration
    });
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
            scrolltop: 50 * (i - 4)
          })
          if (i > 4) {
            this.setData({
              // 此处的滚动距离可以为高度*i,到第5行在进行滚动
              scrolltop: 30 * (i - 4)
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
    // console.log(options.id)
    var id = options.id;
    // var id = 1449794966;
    var that = this;
    wx.request({
      url: 'https://music.yadzxf.com/song/detail?ids='+id,
      success(res){
        console.log(res.data.songs)
        that.setData({
          song: res.data.songs,
          id: id
        })
      }
    })
    this.lrc(id);
  },
  //获取歌曲详情
  onUnload(){
    console.log('页面卸载')
    var that=this;
    this.setData({
      playflag:false
    })
    //音乐停止
    myaudio.stop();
    //停止监听
    myaudio.onStop(() => {
      // console.log('停止播放');
    })
  },
})