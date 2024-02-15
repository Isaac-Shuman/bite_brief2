Every "install" command necessary when running the app:

npm install express //Install Express.js for Node.js server
npm install axios //axios is used by the React.js app to make API requests to the Node.js server

package.json manual modifications (excluding those made by npm install yadayada):

"proxy": "http://localhost:3001" //This line somehow tells the React app to forward requests to unrecognized paths to this port
                                 //this is important because I run node.js on this port

I also ran "node init -y" in the bite_brief2 directory
