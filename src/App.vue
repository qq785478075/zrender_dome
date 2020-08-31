<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
*{
  padding: 0;
  margin: 0;
  border: 0;
}
body,html{
    background: #F7F8FA;
}
#app{
  width: 1200px;
  margin: auto;
background: #fff;
}
</style>
