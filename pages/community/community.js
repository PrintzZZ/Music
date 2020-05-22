// pages/community/community.js
import time from "./../../utils/time.js";
//创建audio控件
const myaudio = wx.createInnerAudioContext();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    boxopen:'',
    index: -1,
    value: 0,
    audioArr: [{
      totaltime: '',
      id: 0,
      content: " ",
      time: 0,
      simpleUserInfo: {
        nickname: "",
        avatar: ""
      },
      simpleResourceInfo: {
        songId: 0,
        name: "",
        artists: [{
          name: ""
        }],
        songCoverUrl: "",
      }
    }],
    audKey: '', //当前选中的音频key
  },
  // 播放
  playbtn: function (e) {
    this.setData({
      index: e.currentTarget.dataset.key
    })
    var that = this,
      id = e.currentTarget.dataset.id,
      key = e.currentTarget.dataset.key,
      audioArr = that.data.audioArr;
    // this.Initialization(key);

    //设置状态
    audioArr.forEach((v, i, array) => {
      v.bl = false;
      if (i == key) {
        v.bl = true;
      }
    })
    that.setData({
      audioArr: audioArr,
      audKey: key,
    })

    myaudio.autoplay = true;
    var audKey = that.data.audKey,
      vidSrc = audioArr[audKey].simpleResourceInfo.songId;
    myaudio.src = vidSrc;

    myaudio.play();
    //开始监听
    myaudio.onTimeUpdate(() => {
      // console.log('进度更新了总进度为：' + myaudio.duration + '当前进度为：' + myaudio.currentTime);
      var min = parseInt(myaudio.duration / 60);
      var sec = parseInt(myaudio.duration % 60);
      var min1 = parseInt(myaudio.currentTime / 60);
      var sec1 = parseInt(myaudio.currentTime % 60);
      var value = 100 - myaudio.currentTime / myaudio.duration * 100
      // console.log(value);

      if (min.toString().length == 1) {
        min = `0${min}`;
      }
      if (sec.toString().length == 1) {
        sec = `0${sec}`;
      }
      if (min1.toString().length == 1) {
        min1 = `0${min1}`;
      }
      if (sec1.toString().length == 1) {
        sec1 = `0${sec1}`;
      }
      var a = 'audioArr[' + key + '].totaltime'
      var time = `${min1}:${sec1}-${min}:${sec}`
      this.setData({
        [a]: time,
        value: value
      })
    })



    //获取音乐时间长度
    this.du(key);
    //  console.log(that.data.audioArr[key].time)

    myaudio.onPlay(() => {
      // console.log('开始播放');
    })
    //结束监听
    myaudio.onEnded(() => {
      // console.log('自动播放完毕');
      audioArr[key].bl = false;
      that.setData({
        audioArr: audioArr,
      })
    })
    //错误回调
    myaudio.onError((err) => {
      console.log(err);
      audioArr[key].bl = false;
      that.setData({
        audioArr: audioArr,
      })
      return
    })
  },
  // 停止
  pausebtn: function (e) {
    // console.log('触发暂停按钮')
    this.setData({
      index: -1
    })
    var that = this,
      key = e.currentTarget.dataset.key,
      audioArr = that.data.audioArr;
    //设置状态
    audioArr.forEach((v, i, array) => {
      v.bl = false;
    })
    that.setData({
      audioArr: audioArr
    })

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
  // 数据请求
  onLoad: function (options) {
    var that = this
    wx.request({
      url: 'https://music.yadzxf.com/comment/hotwall/list',
      success(res) {
        that.insertbl(res.data.data)
      }
    })
    // var a = time.timeConvert(1588786469652);
    // console.log(a)
  },
  insertbl(res) {
    // 给数组添加播放状态
    // 解析时间戳
    let array = [];
    let list = res;
    list.map((item, index) => {
      var timevlue = time.timeConvert(item.time);
      var songurl = item.simpleResourceInfo.songId;
      array.push(Object.assign(item, {
        bl: false
      }))
      array[index].id = item.id;
      array[index].content = item.content;
      array[index].time = timevlue;
      array[index].simpleUserInfo.nickname= item.simpleUserInfo.nickname;
      array[index].simpleUserInfo.avatar = item.simpleUserInfo.avatar
      array[index].simpleResourceInfo.songId = `https://music.163.com/song/media/outer/url?id=${songurl}.mp3`;
      array[index].simpleResourceInfo.name = item.simpleResourceInfo.name;
      array[index].simpleResourceInfo.artists.name = item.simpleResourceInfo.artists.name;
      array[index].simpleResourceInfo.songCoverUrl = item.simpleResourceInfo.songCoverUrl
    });
    this.setData({
      audioArr: array
    })
    console.log(this.data.audioArr);
  },
  onShow: function(){
    wx.request({
      url: 'https://music.yadzxf.com/comment/hotwall/list',
      success(res) {
        console.log(res)
      }
    })
    console.log(1)
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