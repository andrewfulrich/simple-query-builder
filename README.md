# simple-query-builder

This provides four simple functions for building parameterized queries that you can pass into pg.query

NOTE: Version 2.0 is not backwards compatible. It fixes orderBy and changes the parameters of the find function. The final parameter is now just an array of columns which should be queried with "LIKE". Also if orderBy is included in the "params" object, it should be an array of strings of the form "columnName.direction" where ".direction" is ".asc" or ".desc" or omitted.


## find(tableName,params, columnsToSelect,likeColumns=[])

make a search parameterized query

### parameters
| name | description |
| --- | --- |
| tableName | the name of the table |
| params | a map of columns to values |
| columnsToSelect | a list of columns to select |
| likeColumns | if you have like queries, this would be a list of which columns should be queried with "like"

### returns
an object with a text property containing the query string and a values property containing the values of the parameterized query

## update(tableName,columnValueMap,primaryKeyName,primaryKeyVal)

make an update parameterized query

### parameters
| name | description |
| --- | --- |
| tableName | the name of the table |
| params | a map of columns to values |
| primaryKeyName | the name of the primary key column |
| primaryKeyVal | the value of the primary key of the thing you want to update |

### returns
an object with a text property containing the query string and a values property containing the values of the parameterized query

## del
make a delete parameterized query- notice it's not called delete because that's a reserved word in js

### parameters
| name | description |
| --- | --- |
| tableName | the name of the table |
| primaryKeyName | the name of the primary key column |
| primaryKeyVal | the value of the primary key of the thing you want to update |

### returns
an object with a text property containing the query string and a values property containing the values of the parameterized query

## insert(tableName,primaryKeyName,columnValueMap)

make an insert parameterized query

### parameters
| name | description |
| --- | --- |
| tableName | the name of the table |
| primaryKeyName | the name of the primary key column |
| columnValueMap | a map of columns to values |

### returns
an object with a text property containing the query string and a values property containing the values of the parameterized query
