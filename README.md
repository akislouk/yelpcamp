# YelpCamp

YelpCamp is a full-stack web application that allows users to view, create, edit and delete campgrounds. Users can also leave reviews and ratings on campgrounds. It was implemented as a project for the Web Developer Bootcamp course by Colt Steele on Udemy.

## Main Technologies

- Node.js
- Express
- MongoDB
- Mongoose
- EJS
- Bootstrap
- Mapbox API
- Cloudinary API
- Joi

## Application Setup

[Node.js](https://nodejs.org/en/download/) (v18 or higher) and [MongoDB](https://www.mongodb.com/try/download/community) are required to run the application.

With Node.js installed, you have to install the application's dependencies by running the following command in the terminal:

```shell
npm i
```

You will also need to create an account on [Mapbox](https://www.mapbox.com/) and [Cloudinary](https://cloudinary.com/) to get the necessary API keys. Once you have those, you need to create a `.env` file in the root directory of the project where you set the following environment variables:

- `NODE_ENV`: The environment in which the application is running (development or production). Default is development.
- `PORT`: The port where the application will run on. Default is 3000.
- `DB_URL`: The URL to connect to the MongoDB database. Default is `mongodb://localhost:27017/yelp-camp`.
- `SECRET`: The secret key used to encrypt and decrypt the session data and cookies.
- `CLOUDINARY_URL`: The URL to connect to the Cloudinary API.
- `CLOUDINARY_CLOUD_NAME`: The cloud name of your Cloudinary account.
- `CLOUDINARY_KEY`: The API key of your Cloudinary account.
- `CLOUDINARY_SECRET`: The API secret of your Cloudinary account.
- `MAPBOX_TOKEN`: The token to connect to the Mapbox API.

You can use the `.env.template` file as a reference. It includes all the environment variables, so you can simply fill in the values and copy the content to the `.env` file.

Finally, to execute the application, make sure MongoDB is running and simply run

```shell
node app.js
```

By default, the application will be available at <http://localhost:3000> (or the port specified in the `.env` file).

Once you use the application and create a user, you can seed the database with some campgrounds with the command

```shell
node seeds/index.js
```

**Beware that this action will delete all existing campgrounds (and reviews) from the database and create new ones.**

## To Do

- In the campgrounds index page, load only 10 campgrounds at a time and add a button to load more.
- Hide the review form if the user has already submitted a review for the campground.
- Use grid system for image thumbnails in edit page.
- Implement user roles (admin, user).
- Add a button to go back on error page.
