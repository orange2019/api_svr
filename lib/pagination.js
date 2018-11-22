/**
 * 分页类(样式基于bootstrap)
 */
class Pagination {

  constructor(){
    this.showNum = 6
    if (this.showNum <= 3){
      this.showNum = 3
    }

    this.prev = '&lt;'
    this.next = '&gt;'
  }

  create(url , count , page = 1 , size = 10 , query = {}){
    // console.log('create' ,query)
    let total = Math.ceil(count / size)
    let currentNum = parseInt(page)
    let pagination = ''
    
    pagination += '<ul class="pagination">'
    pagination += this._createPrev(url , total , currentNum , query)

    if (total <= this.showNum){
      for(let i = 1;i <= total;i++){
        pagination += this._createNumUrl(url , i , currentNum ,query)
      }
    }else {
      if (currentNum <= this.showNum / 2){

        for(let i = 1;i <= currentNum + 1;i++){
          pagination += this._createNumUrl(url , i , currentNum ,query)
        }
        pagination += '<li class="page-item disabled"><a class="page-link" href="javascript:;" >...</a></li>'
        for(let i = total - 1;i<=total;i++){
          pagination += this._createNumUrl(url , i , currentNum ,query)
        }

      }else if(currentNum > this.showNum / 2 && currentNum <= total){

        if (currentNum > 2){
          pagination += this._createNumUrl(url , 1 , currentNum ,query)
          if (currentNum - 1 != 2){
            pagination += '<li class="page-item disabled"><a class="page-link" href="javascript:;" >...</a></li>'
          }
        }
        
        let last = (total <= currentNum + 1) ? total : currentNum + 1
        for(let i = currentNum - 1;i<=last;i++){
          pagination += this._createNumUrl(url , i , currentNum ,query)
        }

        if (currentNum <= total -2){
          if (currentNum + 1 != total - 1){
            pagination += '<li class="page-item disabled"><a class="page-link" href="javascript:;" >...</a></li>'
          }
          
          pagination += this._createNumUrl(url , total , currentNum ,query)
        }
        
      }
    }

    pagination += this._createNext(url , total , currentNum , query)
    pagination += '</ul>'

    return pagination
  }

  _createPrev(url , total , currentNum , query = {}){
    let str = ''
    if (1 == currentNum){
      str += '<li class="page-item disabled"><a class="page-link" href="javascript:;" >' + this.prev + '</a></li>'
    }else {
      let num = parseInt(currentNum) - 1
      let href = this._createHref(url , num , query)
      str += '<li class="page-item "><a class="page-link" href="' + href + '" >' + this.prev + '</a></li>'
    }

    return str
  }

  _createNext(url , total , currentNum , query = {}){
    let str = ''
    if (total == currentNum){
      str += '<li class="page-item disabled"><a class="page-link" href="javascript:;" >' + this.next + '</a></li>'
    }else {
      let num = parseInt(currentNum) + 1
      let href = this._createHref(url , num , query)
      str += '<li class="page-item "><a class="page-link" href="' + href + '" >' + this.next + '</a></li>'
    }

    return str
  }

  _createNumUrl(url , pageNum , currentNum ,query = {}){

    let str = ''
    let href = this._createHref(url , pageNum , query)
    if (pageNum == currentNum){
      str += '<li class="page-item active"><a class="page-link" href="javascript:;" >' + pageNum + '</a></li>'
    }else {
      str += '<li class="page-item"><a class="page-link" href="'+ href +'">' + pageNum + '</a></li>'
    }

    return str
  }

  _createHref(url , pageNum , query = {}){
    // console.log('create href' , query)
    let href = url + '?page=' + pageNum
    for (let k in query) {
      if (query.hasOwnProperty(k)) {
        href += '&' + k + '=' + query[k]
      }
    }
    
    return href
  }
}

module.exports = new Pagination()