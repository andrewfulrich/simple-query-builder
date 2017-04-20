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
 * @param columnValueMap
 * @returns {*}
 */
function makeClauses(columnNames,columnValueMap) {
  return columnNames.reduce((accumulator,currentValue,currentIndex)=>{
    accumulator.clauses.push(currentValue+'=$'+(currentIndex+1))
    accumulator.values.push(columnValueMap[currentValue])
    return accumulator
  },{
    clauses:[],
    values:[]
  })
}

/**
 * makes the LIKE clauses in your query
 * @param columnValueMap
 * @param index
 * @returns {*}
 */
function makeLikeClauses(columnValueMap,index) {
  return Object.keys(columnValueMap).reduce((accumulator,currentValue,currentIndex)=>{
    accumulator.clauses.push(currentValue+' like $'+(currentIndex+1+index))
    accumulator.values.push('%'+columnValueMap[currentValue]+'%')
    return accumulator
  },{
    clauses:[],
    values:[]
  })
}

/**
 * make a search parameterized query
 * @param tableName the name of the table
 * @param columnValueMap a map of columns to values
 * @param columnsToSelect a list of columns to select
 * @param likeColumnValueMap if you have like queries, this would be the map of the column names to the "like" values
 * @returns {{text: string, values}}
 */
function find(tableName,columnValueMap, columnsToSelect,likeColumnValueMap={}) {
  var queryText='SELECT '+columnsToSelect.join(', ')+' FROM '+tableName
  var whereColumns=Object.keys(columnValueMap).filter((key)=>{
    return ['limit','offset','orderBy','isAscOrder'].indexOf(key) == -1
  })
  if(whereColumns.length>0 || Object.keys(likeColumnValueMap).length>0) {
    queryText+=' WHERE '
  }
  var whereClauses=makeClauses(whereColumns,columnValueMap)
  var whereLikeClauses=makeLikeClauses(likeColumnValueMap,whereClauses.clauses.length)

  queryText+=whereClauses.clauses.join(' AND ')
  queryText+=whereLikeClauses.clauses.length > 0 && whereClauses.clauses.length > 0 ? ' AND ':''
  queryText+=whereLikeClauses.clauses.join(' AND ')
  var applyVals=whereClauses.values.concat(whereLikeClauses.values)
  if(columnValueMap.orderBy != undefined && columnValueMap.orderBy != '') {
    applyVals.push(columnValueMap.orderBy)
    queryText += ' ORDER BY $'+(applyVals.length)
    if(columnValueMap.isAscOrder != undefined) {
      queryText += (columnValueMap.isAscOrder ? ' ASC' : ' DESC')
    }
  }
  if(columnValueMap.limit != undefined && columnValueMap.limit != 0) {
    applyVals.push(columnValueMap.limit)
    queryText += ' LIMIT $'+(applyVals.length)
    if(columnValueMap.offset != undefined) {
      applyVals.push(columnValueMap.offset)
      queryText += ' OFFSET $'+(applyVals.length)
    }
  }
  return {
    text:queryText,
    values:applyVals
  }
}

/**
 * make an update parameterized query
 * @param tableName
 * @param tableName the name of the table
 * @param columnValueMap a map of columns to values
 * @param primaryKeyName the name of the primary key column
 * @param primaryKeyVal the value of the primary key of the thing you want to update
 * @returns {{text: string, values: (Array|*|Array.<T>)}}
 */
function update(tableName,columnValueMap,primaryKeyName,primaryKeyVal) {
  var queryText='UPDATE '+tableName+' SET '
  const toUpdate=Object.keys(columnValueMap).filter((c)=>c!=primaryKeyName)
  var setClauses=makeClauses(toUpdate,columnValueMap)
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
 * @param columnValueMap a map of columns to values
 * @returns {{text: string, values: Array}}
 */
function insert(tableName,primaryKeyName,columnValueMap) {
  var queryText='INSERT INTO '+tableName
  var keys=Object.keys(columnValueMap)
  queryText+=' ('+keys.join(', ')+') VALUES'
  var insertVals=keys.reduce((accumulator,currentValue,currentIndex)=>{
    accumulator.clauses.push('$'+(currentIndex+1))
    accumulator.values.push(columnValueMap[currentValue])
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