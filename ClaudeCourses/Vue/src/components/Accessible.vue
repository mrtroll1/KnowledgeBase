<script setup>

</script>

<template>
<fieldset>
  <legend>Using aria-labelledby lol wtf</legend>
  <label id="date-label" for="date">Current Date: </label>
  <input
    type="date"
    name="date"
    id="date"
    aria-labelledby="date-label date-instructions"
  />
  <p id="date-instructions">MM/DD/YYYY</p>
</fieldset>
<fieldset>
  <legend>Using aria-describedby</legend>
  <label id="dob" for="dob">Date of Birth: </label>
  <input type="date" name="dob" id="dob" aria-describedby="dob-instructions" />
  <p id="dob-instructions">MM/DD/YYYY</p>
</fieldset>
<form role="search">
  <label for="search" class="hidden-visually">Search: </label>
  <input type="text" name="search" id="search" v-model="search" />
  <input
    type="image"
    class="btnImg"
    src="https://img.icons8.com/search"
    alt="Search"
  />
</form>
</template>