
FROM node:10

# Create app directory
WORKDIR /usr/src/app

# Copy over the working HEAD we downloaded from S3
COPY . .

# Setup Git for our user
RUN git config --global user.name "jones"
RUN git config --global user.email "jones@koji-projects.com"

# Run the init script to get our working directory set up if it needs to be
RUN chmod +x ./.remy/scripts/init.sh
RUN ./.remy/scripts/init.sh https://github.com/facebook/create-react-app.git create-react-app

# Run install commands if we have them
RUN npm install --prefix .remy
RUN npm install --prefix frontend

# Start remy
CMD npm start --prefix ./.remy
