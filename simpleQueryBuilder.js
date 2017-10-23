/**
 SimpleQueryBuilder

 Some functions for building parameterized queries

 Author: Andrew Ulrich

 MIT License

 Copyright (c) 2017 Andrew F. Ulrich

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.
 */

/**
 * makes the WHERE clauses in your query
 * @param columnNames
 * @param params
 * @returns {*}
 */
function makeClauses(columnNames,params) {
  return columnNames.reduce((accumulator,currentValue,currentIndex)=>{
    accumulator.clauses.push(currentValue+'=$'+(currentIndex+1))
    accumulator.values.push(params[currentValue])
    return accumulator
  },{
    clauses:[],
    values:[]
  })
}

/**
 * makes the LIKE clauses in your query
 * @param params
 * @param index
 * @returns {*}
 */
function makeLikeClauses(params,index) {
  return Object.keys(params).reduce((accumulator,currentValue,currentIndex)=>{
    accumulator.clauses.push(currentValue+' like $'+(currentIndex+1+index))
    accumulator.values.push('%'+params[currentValue]+'%')
    return accumulator
  },{
    clauses:[],
    values:[]
  })
}

/**
 * sanitize the orderBy param to be used by the find function
 * @param orderBy - is assumed to be an array of "columnName.direction" strings where ".direction" is ".asc", ".desc", or not present
 * @param columnsToSelect - list of selected columns. You can only order by the columns you select
 * @returns {*} a mapping of column name to direction (asc/desc)
 */
function sanitizeOrderBy(orderBy,columnsToSelect) {
  let orderByArray=orderBy
  if(undefOrBlank(orderBy)) {
    orderByArray=[]
  } else if(typeof orderBy == 'string') {
    orderByArray = [orderBy]
  }
  if(!Array.isArray(orderByArray)) {
    throw new Error('orderBy param must be an array of "columnName.direction" strings where ".direction" is ".asc", ".desc", or not present')
  }
  return orderByArray
    .filter(orderString=>columnsToSelect.includes(orderString.split('.')[0]))
    .map(orderString=>({
      column:orderString.split('.')[0],
      direction:orderString.split('.').length > 1 ? orderString.split('.')[1] : 'ASC'
    }))
    .filter(orderObj=>orderObj.direction.toLowerCase() == 'asc' || orderObj.direction.toLowerCase() == 'desc')
    .reduce((accum,orderObj)=>Object.assign(accum,{[orderObj.column]:orderObj.direction}),{})
}

function sanitizeLimit(limit) {
  const justDefault= undefOrBlank(limit) || isNaN(parseInt(limit)) || parseInt(limit) === 0
  return justDefault ?  10 : parseInt(limit)
}

function undefOrBlank(thing) {
  return thing==undefined||thing===''
}

/**
 * make a search parameterized query
 * @param tableName the name of the table
 * @param params a map of columns to values
 * @param columnsToSelect a list of columns to select
 * @param likeColumns if you have like queries, this would be a list of which columns should be queried with "like"
 * @returns {{text: string, values}}
 */
function find(tableName,params,columnsToSelect,likeColumns=[]) {
  const likeSearchParams=Object.keys(params)
    .filter(param=>likeColumns.includes(param))
    .reduce((accum,curr)=>Object.assign(accum,{[curr]:params[curr]}),{})

  const equalSearchParams=Object.keys(params)
    .filter(param=>!likeColumns.includes(param))
    .filter(param=>!['limit','offset','orderBy','isAscOrder'].includes(param))
    .reduce((accum,curr)=>Object.assign(accum,{[curr]:params[curr]}),{})

  const limit=sanitizeLimit(params.limit)
  const offset=undefOrBlank(params.offset) || isNaN(parseInt(params.limit)) ? 0 : parseInt(params.offset)

  var queryText='SELECT '+columnsToSelect.join(', ')+' FROM '+tableName

  if(Object.keys(equalSearchParams).length>0 || Object.keys(likeSearchParams).length>0) {
    queryText+=' WHERE '
  }
  var whereClauses=makeClauses(Object.keys(equalSearchParams),equalSearchParams)
  var whereLikeClauses=makeLikeClauses(likeSearchParams,whereClauses.clauses.length)

  queryText+=whereClauses.clauses.join(' AND ')
  queryText+=whereLikeClauses.clauses.length > 0 && whereClauses.clauses.length > 0 ? ' AND ':''
  queryText+=whereLikeClauses.clauses.join(' AND ')

  const orderBy=sanitizeOrderBy(params.orderBy,columnsToSelect)
  if(Object.keys(orderBy).length > 0) {
    queryText += ' ORDER BY '
    queryText += Object.keys(orderBy)
      .map(orderCol=>`${orderCol} ${orderBy[orderCol]}`)
      .join(', ')
  }
  var applyVals=whereClauses.values.concat(whereLikeClauses.values)
  applyVals.push(limit)
  queryText += ' LIMIT $'+(applyVals.length)
  applyVals.push(offset)
  queryText += ' OFFSET $'+(applyVals.length)
  return {
    text:queryText,
    values:applyVals
  }
}

/**
 * make an update parameterized query
 * @param tableName
 * @param tableName the name of the table
 * @param params a map of columns to values
 * @param primaryKeyName the name of the primary key column
 * @param primaryKeyVal the value of the primary key of the thing you want to update
 * @returns {{text: string, values: (Array|*|Array.<T>)}}
 */
function update(tableName,params,primaryKeyName,primaryKeyVal) {
  var queryText='UPDATE '+tableName+' SET '
  const toUpdate=Object.keys(params).filter((c)=>c!=primaryKeyName)
  var setClauses=makeClauses(toUpdate,params)
  queryText += setClauses.clauses.join(', ')
  setClauses.values.push(primaryKeyVal)
  queryText += ' WHERE '+primaryKeyName+'=$'+(setClauses.values.length)
  return {
    text:queryText,
    values:setClauses.values
  }
}

/**
 * make a delete parameterized query- notice it's not called delete because that's a reserved word in js
 * @param tableName the name of the table
 * @param primaryKeyName the name of the primary key column
 * @param primaryKeyVal the value of the primary key of the thing you want to delete
 * @returns {{text: string, values: [*]}}
 */
function del(tableName,primaryKeyName,primaryKeyVal) { //delete is a reserved word so naming it del
  return {
    text:'DELETE FROM '+tableName+' WHERE '+primaryKeyName+'=$1',
    values:[primaryKeyVal]
  }
}

/**
 * make an insert parameterized query
 * @param tableName the name of the table
 * @param primaryKeyName the name of the primary key column
 * @param params a map of columns to values
 * @returns {{text: string, values: Array}}
 */
function insert(tableName,primaryKeyName,params) {
  var queryText='INSERT INTO '+tableName
  var keys=Object.keys(params)
  queryText+=' ('+keys.join(', ')+') VALUES'
  var insertVals=keys.reduce((accumulator,currentValue,currentIndex)=>{
    accumulator.clauses.push('$'+(currentIndex+1))
    accumulator.values.push(params[currentValue])
    return accumulator
  },{
    clauses:[],
    values:[]
  })
  queryText+=' ('+insertVals.clauses.join(', ')+') RETURNING '+primaryKeyName
  return {
    text:queryText,
    values:insertVals.values
  }
}

module.exports={
  find:find,
  update:update,
  del:del,
  insert:insert
}