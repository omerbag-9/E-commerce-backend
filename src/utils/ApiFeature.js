export class ApiFeature {
    constructor(mongooseQuery, queryData) {
        this.mongooseQuery = mongooseQuery
        this.queryData = queryData
    }
    pagination() {
        /**
     * page     size     skip
     *  1   =>  1-5       0
     *  2   =>  6-10      5
     *  3   =>  11-15     10
     * skip = (page - 1) * size
     */
    let {page , size} = this.queryData
        page = parseInt(page) // delete the decimal number if found
        size = parseInt(size) // delete the decimal number if found
        if (page <= 0) page = 1
        if (size <= 0) size = 2
        const skip = (page - 1) * size
        this.mongooseQuery.limit(size).skip(skip)
        return this
    }

    sort(){
        this.mongooseQuery.sort(this.queryData.sort?.replaceAll(',' , " "))
        return this
    }

    select(){
        this.mongooseQuery.select(this.queryData.select?.replaceAll(',' , " "))
        return this
    }

    filter(){
        let {page , size , sort , select , ...filter} = this.queryData
        filter = JSON.parse(JSON.stringify(filter).replace(/get|gte|lt|lte/g , match => `$${match}`))
        this.mongooseQuery.find(filter)
        return this
    }
}