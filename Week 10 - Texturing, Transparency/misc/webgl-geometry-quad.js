/*
 * A simple object to encapsulate the data and operations of object rasterization
 */
function WebGLGeometryQuad (gl) {
	this.gl = gl;
	this.worldMatrix = new Matrix4();

	// -----------------------------------------------------------------------------
	this.getPosition = function() {
		// todo #9 - return a vector4 of this object's world position contained in its matrix
		return new Vector4(
			this.worldMatrix.elements[3],
			this.worldMatrix.elements[7],
			this.worldMatrix.elements[11],
			
		).normalize();
		
	}

	// -----------------------------------------------------------------------------
	this.create = function(rawImage) {
		var verts = [
			-1.0, -1.0, 0.0,
			1.0, -1.0, 0.0,
			-1.0, 1.0, 0.0,
			1.0, 1.0, 0.0
		];

		var normals = [
			0.0, 0.0, 1.0,
			0.0, 0.0, 1.0,
			0.0, 0.0, 1.0,
			0.0, 0.0, 1.0,
		];

		var uvs = [
			0.0, 0.0,
			1.0, 0.0,
			0.0, 1.0,
			1.0, 1.0
		];

		var indices = [0, 1, 2, 2, 1, 3];
		this.indexCount = indices.length;

		// create the position and color information for this object and send it to the GPU
		this.vertexBuffer = this.gl.createBuffer();
		this.gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
		this.gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

		this.normalBuffer = this.gl.createBuffer();
		this.gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
		this.gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

		this.texCoordsBuffer = this.gl.createBuffer();
		this.gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordsBuffer);
		this.gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvs), gl.STATIC_DRAW);

		this.indexBuffer = this.gl.createBuffer();
		this.gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
		this.gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

		if (rawImage) {
			// todo #4 - create the texture (uncomment when ready)
			// 1.
			
			

			this.texture = gl.createTexture();

			this.gl.activeTexture(gl.TEXTURE0);
            this.gl.bindTexture(gl.TEXTURE_2D, this.texture);

			// 2. bind the texture

			// needed for the way browsers load images, ignore this
			this.gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

			// 3. set wrap modes (for s and t) for the texture
            this.gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			this.gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
			// 4. set filtering modes (magnification and minification)
			this.gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			this.gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			// 5. send the image WebGL to use as this texture
            this.gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE,rawImage);
			// We're done for now, unbind
			this.gl.uniform1i(textureShaderProgram.textureUniform,0);
			this.gl.bindTexture(gl.TEXTURE_2D, null);
		}
	}

	// -------------------------------------------------------------------------
	this.render = function(camera, projectionMatrix, shaderProgram) {
		this.gl.useProgram(shaderProgram);

		var attributes = shaderProgram.attributes;
		var uniforms = shaderProgram.uniforms;

		this.gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
		this.gl.vertexAttribPointer(
			attributes.vertexPositionAttribute,
			3,
			this.gl.FLOAT,
			this.gl.FALSE,
			0,
			0
		);
		this.gl.enableVertexAttribArray(attributes.vertexPositionAttribute);

		if (attributes.hasOwnProperty('vertexNormalsAttribute')) {
			this.gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
			this.gl.vertexAttribPointer(
				attributes.vertexNormalsAttribute,
				3,
				this.gl.FLOAT,
				this.gl.FALSE,
				0,
				0
			);
			this.gl.enableVertexAttribArray(attributes.vertexNormalsAttribute);
		}

		if (attributes.hasOwnProperty('vertexTexcoordsAttribute')) {
			this.gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordsBuffer);
			this.gl.vertexAttribPointer(
				attributes.vertexTexcoordsAttribute,
				2,
				this.gl.FLOAT,
				this.gl.FALSE,
				0,
				0
			);
			this.gl.enableVertexAttribArray(attributes.vertexTexcoordsAttribute);
		}

		if (this.texture) {
			// todo #4
			// uncomment when ready
			this.gl.activeTexture(gl.TEXTURE0);
			this.gl.bindTexture(gl.TEXTURE_2D, this.texture);
		}

		// Send our matrices to the shader
		this.gl.uniformMatrix4fv(uniforms.worldMatrixUniform, false, this.worldMatrix.clone().transpose().elements);
		this.gl.uniformMatrix4fv(uniforms.viewMatrixUniform, false, camera.getViewMatrix().clone().transpose().elements);
		this.gl.uniformMatrix4fv(uniforms.projectionMatrixUniform, false, projectionMatrix.clone().transpose().elements);

		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
		this.gl.drawElements(this.gl.TRIANGLES, this.indexCount, gl.UNSIGNED_SHORT, 0);

		this.gl.bindTexture(this.gl.TEXTURE_2D, null);
		this.gl.disableVertexAttribArray(attributes.vertexPositionAttribute);
		this.gl.disableVertexAttribArray(attributes.vertexNormalsAttribute);

		if (attributes.hasOwnProperty('vertexTexcoordsAttribute')) {
			this.gl.disableVertexAttribArray(attributes.vertexTexcoordsAttribute);
		}
	}
}

// EOF 00100001-10