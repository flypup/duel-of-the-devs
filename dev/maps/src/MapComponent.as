package {

	public class MapComponent {

		/**
		 * Type of Map Element
		 * floor (Plane / Box - z on top, deoth goes down)
		 * wall  (Box - z on bottom, deoth goes up)
		 * steps (sloped Box / series of Boxes?)
		 * entity (Game Entity instance)
		 * parallax (2d Poster / Tile?)
		 */

		[Inspectable(defaultValue="floor",enumeration="floor,wall,entity,parallax,steps")]
		public var mapType:String = "floor";


		/**
		 * Entity Shape (box, circle)
		 */

		[Inspectable(defaultValue="box",enumeration="box,circle,polygons")]
		public var shape:String = "box";


		/**
		 * Entity Type (Player, Ninja, Monk, Cauldron, LionStatue...)
		 */

		[Inspectable(defaultValue="Custom",enumeration="Player,Ninja,Box,Circle,Custom")]
		public var type:String = "Custom";


		/**
		 * Mass (0 = static)
		 */

		[Inspectable(defaultValue=0.0)]
		public var mass:Number = 0;


		
		/**
		 * Z Position
		 */

		[Inspectable(defaultValue=0.0)]
		public var mZ:Number = 0;


		/**
		 * Box Dimensions (circle radius = mWidth / 2
		 * x axis: mWidth
		 * y axis: mHeight
		 * z axis: mDepth
		 */

		[Inspectable(defaultValue=0.0)]
		public var mWidth:Number = 0;

		[Inspectable(defaultValue=64)]
		public var mHeight:Number = 64;

		[Inspectable(defaultValue=64)]
		public var mDepth:Number = 64;


		/**
		 * Notes
		 */

		[Inspectable(defaultValue="",type="String")]
		public var notes:String = "";



	}

}