// pages/search/search.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    inputvalue:'',
    hotsearch:[],
    sboxclass:'',
    snboxclass:'',
    songlist:[],
    url:''
  },
  //监听搜索事件
  searchBtn(e){
    // console.log('确定'+e.detail.value)
    var value = e.detail.value;
    setTimeout(() => {
      this.search(value);
    }, 500);
    this.setData({
      songlist:[],
      snboxclass:'searchnoneboxclose'
    })
  },
  //监听输入事件
  inputbnt(e){
    var value = e.detail.value;
    if(value == ''){
      this.setData({
        sboxclass:'noneopen',
        snboxclass:'',
        songlist:[]
      })
    }
  },
  //热搜单击事件
  tap(e){
    // console.log(e.currentTarget.dataset.name)
    var keyword = e.currentTarget.dataset.name
    setTimeout(() => {
      this.search(keyword);
    }, 500);
    this.setData({
      inputvalue:keyword,
      snboxclass:'searchnoneboxclose'
    })
  },
  //搜索请求
  search(keyword){
    var that = this;
    wx.request({
      url: 'https://music.yadzxf.com/search?keywords='+keyword,
      success(res){
        // console.log(res.data)
        that.setData({
          songlist:res.data.result.songs
        })
        var id = res.data.result.songs[0].album.id;
        that.url(id)
      }
    })
  },
  //获取最佳结果封面
  url(id){
    var that = this
    wx.request({
      url: 'https://music.yadzxf.com/album?id='+id,
      success(res){
        // console.log(res.data.album.blurPicUrl)
        // console.log(that.data.songlist[0])
        var arr = that.data.songlist
        arr[0].imgurl=res.data.album.blurPicUrl;
        that.setData({
          songlist: arr
        })
      }
    })
  },
  //聚焦事件
  inpfocus(){
    // console.log('聚焦')
    this.setData({
      snboxclass:'searchnoneboxclose',
      sboxclass:'',
    })
  },
  //失去焦点事件
  inpfocusx(){
    // console.log('失去焦点')
  },
  //点击歌曲，获取id
  songtap(e){
    console.log(e.currentTarget.dataset.id)
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/detail/detail?id='+id
   })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    wx.request({
      url: 'https://music.yadzxf.com/search/hot',
      success(res){
        that.setData({
          hotsearch:res.data.result.hots,
        })
      }
    })
  },
  onShow(){
    this.setData({
      sboxclass:'noneopen',
      snboxclass:'',
      songlist:[]
    })
  },
  onHide(){
    this.setData({
      sboxclass:''
    })
  }
})