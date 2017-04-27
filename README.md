# simple-query-builder

This provides four simple functions for building parameterized queries that you can pass into pg.query

## find(tableName,columnValueMap, columnsToSelect,likeColumnValueMap={})

make a search parameterized query

### parameters
| name | description |
| --- | --- |
| tableName | the name of the table |
| columnValueMap | a map of columns to values |
| columnsToSelect | a list of columns to select |
| likeColumnValueMap | if you have like queries, this would be the map of the column names to the "like" values |

### returns
an object with a text property containing the query string and a values property containing the values of the parameterized query

## update(tableName,columnValueMap,primaryKeyName,primaryKeyVal)

make an update parameterized query

### parameters
| name | description |
| --- | --- |
| tableName | the name of the table |
| columnValueMap | a map of columns to values |
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
