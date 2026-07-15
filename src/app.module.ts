import { config } from 'dotenv';
config();

import { DynamicModule, Module, Type } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ServerApiVersion } from 'mongodb';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { ObjectsModule } from './objects/objects.module';

// Liste des modules à importer dans AppModule.
// CloudinaryModule est chargé en permanence pour gérer les uploads d'images.
const imports: Array<Type<any> | DynamicModule | Promise<DynamicModule>> = [
  ConfigModule.forRoot({
    isGlobal: true,
  }),
  CloudinaryModule,
];
/*
const imports: Array<Type<any> | DynamicModule> = [
  
  CloudinaryModule
];
*/
// Si MONGODB_URI est défini, on active la connexion MongoDB.
// Cela permet l'utilisation de la persistance réelle plutôt que du stockage en mémoire.
console.log('MONGODB_URI =', process.env.MONGODB_URI);
if (process.env.MONGODB_URI) {
  imports.unshift(
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri: process.env.MONGODB_URI,
        serverApi: {
          version: ServerApiVersion.v1,
          strict: true,
          deprecationErrors: true,
        },
        connectionFactory: (connection) => {
          // Sur erreur de connexion MongoDB, on affiche un message clair en console.
          connection.on('error', (error: any) => {
            console.error('ECHEC DE CONNEXION A LA BASE DE DONNEE', error);
          });
          // Quand la connexion est établie, afficher une confirmation.
          connection.once('open', () => {
            console.log('CONNEXION A LA BASE DE DONNEE EFFECTUEE AVEC SUCCES');
          });
          return connection;
        },
      }),
    }),
  );

  // Active les fonctionnalités de l'objet avec base de données.
  imports.push(ObjectsModule.forRoot(true));
} else {
  // Si la variable d'environnement n'existe pas, on utilise le mode mémoire.
  imports.push(ObjectsModule.forRoot(false));
}

@Module({
  imports,
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
