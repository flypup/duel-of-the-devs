package {

	public class SpawnPoint {
		
		/**
		 * Z Position
		 */

		[Inspectable(defaultValue=0.0)]
		public var z:Number = 0;

		/**
		 * Entity Class
		 */

		[Inspectable(defaultValue="Ninja",enumeration="Ninja,Player,Projectile,Puff")]
		public var entityClass:String = ""; //"Ninja", "Player"//Monk, "Projectile", "Puff"...

		/**
		 * Input Class
		 */

		[Inspectable(defaultValue="GoalBasedInput",enumeration="GoalBasedInput,EnemyInput,UserInput")]
		public var inputClass:String = ""; //"EnemyInput", "UserInput"//player

		/**
		 * Spawn Frequency (instances per second)
		 */
		[Inspectable(defaultValue=0)]
		public var frequency:Number = 0;

		/**
		 * Pool Size (max number of instances)
		 */
		[Inspectable(defaultValue=0)]
		public var poolSize:int = 0;



	}

}