const tape=require('tape')
const simpleQueryBuilder=require('../simpleQueryBuilder')

tape('make a full find query',t=>{
  t.plan(2)
  const expectedQuery="SELECT foo, bar FROM theTable WHERE fee=$1 AND fo=$2 ORDER BY $3 DESC LIMIT $4 OFFSET $5"
  const resultingQuery=simpleQueryBuilder.find('theTable',{
    fee:'fi',
    fo:'fum',
    orderBy:'foo',
    limit:10,
    offset:20,
    isAscOrder:false
  },['foo','bar'])
  t.equal(resultingQuery.text,expectedQuery,'the find queries should match')
  t.deepEqual(resultingQuery.values,['fi','fum','foo',10,20],'the values to apply should match')
})

tape('make a minimal find query',t=>{
  t.plan(2)
  const expectedQuery="SELECT foo, bar FROM theTable WHERE fee=$1 AND fo=$2"
  const resultingQuery=simpleQueryBuilder.find('theTable',{
    fee:'fi',
    fo:'fum',
  },['foo','bar'])
  t.equal(resultingQuery.text,expectedQuery,'the find queries should match')
  t.deepEqual(resultingQuery.values,['fi','fum'],'the values to apply should match')
})

tape('make a find query with no WHERE',t=>{
  t.plan(2)
  const expectedQuery="SELECT foo, bar FROM theTable"
  const resultingQuery=simpleQueryBuilder.find('theTable',{},['foo','bar'])
  t.equal(resultingQuery.text,expectedQuery,'the find queries should match')
  t.deepEqual(resultingQuery.values,[],'the values to apply should match')
})

tape('make an update query',t=>{
  t.plan(4)
  const expectedQuery="UPDATE theTable SET foo=$1, fee=$2, fo=$3 WHERE fiddle=$4"
  const resultingQuery=simpleQueryBuilder.update('theTable',{
    foo:'bar',
    fee:'fi',
    fo:'fum',
    fiddle:'faddle'
  },'fiddle','faddle')
  t.equal(resultingQuery.text,expectedQuery,'the update queries should match')
  t.deepEqual(resultingQuery.values,['bar','fi','fum','faddle'],'the values to apply should match')

  const resultingQuery2=simpleQueryBuilder.update('theTable',{
    foo:'bar',
    fee:'fi',
    fo:'fum'
  },'fiddle','faddle')
  t.equal(resultingQuery2.text,expectedQuery,'the update queries should match even if primary key is not in columnValueMap')
  t.deepEqual(resultingQuery2.values,['bar','fi','fum','faddle'],'the values to apply should match even if primary key is not in columnValueMap')
})

tape('make a delete query',t=>{
  t.plan(2)
  const expectedQuery="DELETE FROM theTable WHERE fiddle=$1"
  const resultingQuery=simpleQueryBuilder.del('theTable','fiddle','faddle')
  t.equal(resultingQuery.text,expectedQuery,'the delete queries should match')
  t.deepEqual(resultingQuery.values,['faddle'],'the values to apply should match')
})

tape('make an insert query',t=>{
  t.plan(2)
  const expectedQuery="INSERT INTO theTable (foo, fee, fo) VALUES ($1, $2, $3) RETURNING foo"
  const resultingQuery=simpleQueryBuilder.insert('theTable','foo',{
    foo:'bar',
    fee:'fi',
    fo:'fum'
  })

  t.equal(resultingQuery.text,expectedQuery,'the insert queries should match')
  t.deepEqual(resultingQuery.values,['bar','fi','fum'],'the values to apply should match')
})