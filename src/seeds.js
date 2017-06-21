
const feathers = require('feathers/client');
const rest = require('feathers-rest/client');
const superagent = require('superagent');
const hooks = require('feathers-hooks');
const auth = require('feathers-authentication-client');

const feathersClient = feathers();

feathersClient
  .configure(hooks())
  .configure(rest('http://localhost:3030').superagent(superagent))
  .configure(auth());

feathersClient.service('users').create(user)
.then(() => {
  feathersClient.authenticate({
    strategy: 'local',
    email: user.email,
    password: user.password
  })
  .then(() => {
    recipes.map((recipe) => {
      feathersClient.service('recipes').create(recipe)
        .then((result) => {
          console.log('Recipe seeded...', result.title);
        }).catch((error) => {
          console.error('Error seeding recipe!', error.message);
        });
    })
  })
  .catch(function(error){
    console.error('Error authenticating!', error);
  });
})
.catch(function(error) {
  console.error('Error creating user!');
});
