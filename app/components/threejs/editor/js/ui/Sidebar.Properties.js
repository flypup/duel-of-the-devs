Sidebar.Properties = function ( signals ) {

	var container = new UI.Panel();

	container.add( new Sidebar.Properties.Object3D( signals ) );
	container.add( new Sidebar.Properties.Geometry( signals ) );
	container.add( new Sidebar.Properties.Material( signals ) );

	return container;

}
