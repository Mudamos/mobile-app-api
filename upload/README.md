Diretório para o repositório do código das API's


Controle de Versão

	Convenção 

		{folder app}_v{number version
    }
	Folders 
    
    APP
		  
      Template : A pasta de templates tem que estar dentro da para pasta do APP
  
    Config/initializers/auth

      Server.js
		  
        require('../../app_v{number_version}/initializers/server')(app, passport);
    	  require('../../app_v{number_version}/routes/index')(app, passport);
    
    Views 
		  
      {folder_name}_v{number_version}
