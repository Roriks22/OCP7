const jwt = require('jsonwebtoken');
 
module.exports = (req, res, next) => {
   try {
    // On récupére le token avec split qui permet de couper dans un tableau.
       const token = req.headers.authorization.split(' ')[1];
    // Utilisation du jwt.verify qui permet l'échange sécurité de tokens entre plusieurs parties en faisant une vérification de l'intégralité et de l'authenticité des données. 
       const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');
       const userId = decodedToken.userId;
    // On renvoie l'userId pour pouvoir l'utiliser dans les routes.
       req.auth = {
           userId: userId
       };
	next();
   } catch(error) {
       res.status(401).json({ error });
   }
};